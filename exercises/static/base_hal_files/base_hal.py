import rclpy
import sys
import threading
import time

# IMPORT BUMPER
# IMPORT CAMERA
# IMPORT LASER
# IMPORT MOTORS
# IMPORT NEURAL_NETWORK
# IMPORT NOISY_ODOMETRY
# IMPORT ODOMETRY
# IMPORT SIM_TIME

freq = 30.0

print("HAL initializing", flush=True)
if not rclpy.ok():
    rclpy.init(args=sys.argv)

    # CREATE BUMPER NODE
    # CREATE CAMERA NODE
    # CREATE LASER NODE
    # CREATE MOTORS NODE
    # CREATE NEURAL_NETWORK NODE
    # CREATE NOISY_ODOMETRY NODE
    # CREATE ODOMETRY NODE
    # CREATE SIM_TIME NODE

    # Spin nodes so that subscription callbacks load topic data
    executor = rclpy.executors.MultiThreadedExecutor()
   
    # ADD BUMPER NODE
    # ADD CAMERA NODE
    # ADD LASER NODE
    # ADD NOISY_ODOMETRY NODE
    # ADD ODOMETRY NODE
    # ADD SIM_TIME NODE

    def __auto_spin() -> None:
        while rclpy.ok():
            executor.spin_once(timeout_sec=0)
            time.sleep(1/freq)
    executor_thread = threading.Thread(target=__auto_spin, daemon=True)
    executor_thread.start()


# BUMPER NODE FUNCTIONS
# CAMERA NODE FUNCTIONS
# LASER NODE FUNCTIONS
# MOTORS NODE FUNCTIONS
# NEURAL_NETWORK NODE FUNCTIONS
# NOISY_ODOMETRY NODE FUNCTIONS
# ODOMETRY NODE FUNCTIONS
# SIM_TIME NODE FUNCTIONS