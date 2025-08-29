import os, time, tempfile, subprocess, re

# Function rebuild frontend pages
def rebuild():
  try:
    env = os.environ.copy()

    # Don't let warnings to trigger exit code 1
    build_cmd = ['yarn', 'run', 'build']
    env['CI'] = 'false'
    env['NODE_OPTIONS'] = '--max-old-space-size=1024'

    t0 = time.monotonic()

    # Generate a temporary file to not overload  RAM with logs
    with tempfile.NamedTemporaryFile(prefix='yarn-build-', suffix='.log', delete=False) as lf:
      log_path = lf.name

    with open(log_path, 'w+', buffering=1) as logf:
      build_result = subprocess.run(
        build_cmd,
        cwd='/RoboticsAcademy/react_frontend',
        stdout=logf,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
        timeout=900,
        env=env,
      )
    
    # Get the last 80 lines of build logs and
    # and saves on tmp file
    tail_lines = []
    try:
      with open(log_path, 'r') as logf:
        lines = logf.readlines()
        tail_lines = lines[-80:]
    except Exception:
      tail_lines = ["<failed to read build log>"]

    build_duration = time.monotonic() - t0
    print("----------------")
    print(f"yarn build exit={build_result.returncode} duration={build_duration:.1f}s log={log_path}")
    print("---- yarn build (tail) ----\n" + "".join(tail_lines) + "---- end ----")

    if build_result.returncode != 0:
      _printError(
        "ERROR ON CREATE EXERCISE (REBUILDING)",
        "ERROR: Fail to rebuild pages",
        f"DETAILS (exit {build_result.returncode}) — see log: {log_path}"
      )
      return {'success': 0}
    
    # Show warnings
    combined_tail = "".join(tail_lines)
    if re.search(r'(entrypoint size limit|asset size limit|Compiled with warnings|WARNING\b)', combined_tail, re.I):
      print("Build had warnings — continuing execution. See log:", log_path)

    return {'success': 1}
  
  except subprocess.TimeoutExpired as e:
    _printError(
      "ERROR ON CREATE EXERCISE (REBUILDING)",
      "ERROR: Timeout running yarn build",
      f"DETAILS: {str(e)}"
    )
    return {'success': 0}

  except Exception as e:
    _printError(
      "ERROR ON CREATE EXERCISE (REBUILDING)",
      "ERROR: Fail to rebuild pages, unexpected error",
      "DETAILS: " + str(e)
    )
    return {'success': 0}

def _printError(head, error, details):
  print("--------------------------")
  print(head)
  print(error)
  print(details)
  print("--------------------------")