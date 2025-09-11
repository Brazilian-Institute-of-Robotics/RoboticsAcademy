from __future__ import annotations

import time
import tempfile
import subprocess
import os
import re
import logging

from pathlib import Path
from threading import Thread, Lock
from contextlib import contextmanager
from typing import Callable, Optional


LOG = logging.getLogger(__name__)

class RebuildCoordinator:
    """
    This coordinator garantees only one frontend rebuild is executed at time.
    Is necessary do this to avoid the case of two rebuilds modifying a file
    at same time
    """

    _state_lock: Lock = Lock()
    _running: bool = False
    _pending: bool = False
    _thread: Optional[Thread] = None

    # Rebuild's config
    FRONTEND_DIR = "/RoboticsAcademy/react_frontend"
    BUILD_CMD = ["yarn", "run", "build"]
    BUILD_TIMEOUT_S = 900
    TAIL_LINES = 80
    WARNING_REGEX = re.compile(
        r"(entrypoint size limit|asset size limit|Compiled with warnings|WARNING\b)",
        re.IGNORECASE,
    )

    @classmethod
    def trigger(cls) -> None:
        """
        trigger or schedule a frontend rebuild.
        """
        with cls._state_lock:
            # Case a rebuild is already running
            if cls._running:
                cls._pending = True
                LOG.debug("A rebuild is already executing, put new rebuild as pending.")
                return

            # Start new Rebuilding
            cls._running = True
            cls._pending = False
            t = Thread(
                target=cls._worker,
                args=(cls._rebuild_once,),
                name="rebuild-worker",
                daemon=True,
            )
            cls._thread = t

        t.start()

    @classmethod
    def is_running(cls) -> bool:
        with cls._state_lock:
            return cls._running

    @classmethod
    def _worker(cls, runner: Callable[[], object]) -> None:
        try:
            while True:
                try:
                    result = runner()
                    LOG.info("Rebuild finished: %r", result)
                except Exception:
                    LOG.exception("Rebuild failed")

                with cls._state_lock:
                    if cls._pending:
                        # Case there are more rebuild executed, restart loop.
                        cls._pending = False
                        LOG.debug("Pending rebuild detected, re.")
                        continue

                    # No rebuild pending, restart _running and end thread.
                    cls._running = False
                    cls._thread = None
                    break
        finally:
            # Garantees states are restarted in exceptions.
            with cls._state_lock:
                cls._running = False
                cls._thread = None
                cls._pending = False

    @classmethod
    def _rebuild_once(cls) -> dict:
        """
        Executes 'yarn run build' with log in a temporary file and tail (a little piece of log) on console.
        """
        env = os.environ.copy()

        env.setdefault("CI", "false")
        env.setdefault("NODE_OPTIONS", "--max-old-space-size=1024")

        t0 = time.monotonic()

        with tempfile.NamedTemporaryFile(prefix="yarn-build-", suffix=".log", delete=False) as lf:
            log_path = lf.name

        with open(log_path, "w+", buffering=1) as logf:
            build_result = subprocess.run(
                cls.BUILD_CMD,
                cwd=cls.FRONTEND_DIR,
                stdout=logf,
                stderr=subprocess.STDOUT,
                text=True,
                check=False,
                timeout=cls.BUILD_TIMEOUT_S,
                env=env,
            )

        tail_lines = []
        try:
            with open(log_path, "r") as logf:
                lines = logf.readlines()
                tail_lines = lines[-cls.TAIL_LINES:]
        except Exception:
            tail_lines = ["<failed to read build log>"]

        build_duration = time.monotonic() - t0
        print("----------------")
        print(f"yarn build exit={build_result.returncode} "
              f"duration={build_duration:.1f}s log={log_path}")
        print("---- yarn build (tail) ----\n" + "".join(tail_lines) + "---- end ----")

        if build_result.returncode != 0:
            cls._print_error(
                "ERROR ON CREATE EXERCISE (REBUILDING)",
                "ERROR: Fail to rebuild pages",
                f"DETAILS (exit {build_result.returncode}) — see log: {log_path}",
            )
            return {
                "success": 0,
                "exit_code": build_result.returncode,
                "duration_s": build_duration,
                "log_path": log_path,
            }

        combined_tail = "".join(tail_lines)
        if cls.WARNING_REGEX.search(combined_tail):
            print("Build had warnings — continuing execution. See log:", log_path)

        return {
            "success": 1,
            "exit_code": build_result.returncode,
            "duration_s": build_duration,
            "log_path": log_path,
        }
    
    @staticmethod
    def _print_error(head: str, error: str, details: str) -> None:
        print("--------------------------")
        print(head)
        print(error)
        print(details)
        print("--------------------------")
