import docker
import time
from django.conf import settings
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

CONTAINER_BASE_NAME = "manager_container_user_"
DOCKER_NETWORK_BASE_NAME = "network_user_"
IMAGE_NAME = "jderobot/robotics-academy:manager"

def startUserContainer(user_id):
    try:
        client = docker.from_env()

        # Verify if image exists
        try:
            client.images.get(IMAGE_NAME)
        except docker.errors.ImageNotFound:
            return {
                'success': 0,
                'error_type': "ImageNotFound",
                'error_message': f"Docker image {IMAGE_NAME} not found at server"
            }

        container_name = CONTAINER_BASE_NAME + str(user_id)
        network_name = DOCKER_NETWORK_BASE_NAME + str(user_id)

        #Delete user's old container in case exists
        delete_old_container(client, container_name, network_name)

        #Create a exclusive network to this user's container
        user_network = client.networks.create(network_name, driver="bridge")

        #Script used on container's start
        entrypoint_file = "/manager_prod.sh" if settings.PRODUCTION == True else "/manager_dev.sh"

        #Path necessary to create volume to entrypoint script
        project_absolute_path = settings.PROJECT_ABSOLUTE_PATH
        src_path = project_absolute_path+"/src"
        entrypoints_path = f"{project_absolute_path}/scripts/RADI/entrypoints"

        #Path necessary to create volumes to worlds, models and launchs
        infra_path = settings.INFRASTRUCTURE_ABSOLUTE_PATH
        customs_robots = infra_path+"/CustomRobots"
        jderobot_drones = infra_path+"/jderobot_drones"
        resources = infra_path+"/resources"
        launchers = infra_path+"/Launchers"
        worlds = infra_path+"/Worlds"

        #Container's expiration in hours
        expiration = settings.USER_CONTAINER_EXPIRATION

        #Generate expiration datetime
        expires_at = (datetime.now(ZoneInfo("America/Sao_Paulo")) + timedelta(hours=expiration)).isoformat()

        container_kwargs = {
            "image": IMAGE_NAME,
            "name": container_name,
            "network": network_name,
            "nano_cpus": 2000000000,  # Container can only use 2 CPU'S cores from host
            "ports": {
                '7163/tcp': None,
                '6080/tcp': None,
                '1108/tcp': None,
            },
            "labels": {
                'expired_at': expires_at,
            },
            "volumes": {
                str(customs_robots): {'bind': '/home/ws/src/CustomRobots' , 'mode': 'ro'},
                str(jderobot_drones): {'bind': '/home/ws/src/jderobot_drones' , 'mode': 'ro'},
                str(resources): {'bind': '/resources' , 'mode': 'ro'},
                str(launchers): {'bind': '/opt/jderobot/Launchers' , 'mode': 'ro'},
                str(worlds): {'bind': '/opt/jderobot/Worlds' , 'mode': 'ro'},
                #str(src_path): {'bind': '/RoboticsApplicationManager', 'mode': 'rw'}
            },
            "entrypoint": entrypoint_file,
            "detach": True,
            "tty": True,
            "stdin_open": True,
            "devices": ["/dev/dri"],
            "healthcheck": {
                "test": ["CMD-SHELL", "test -f /tmp/colcon-build-finished || exit 1"], # Test verify if file colcon-build-finished exists
                "interval": 5_000_000_000,  # How many nanoseconds each test is executed
                "timeout": 3_000_000_000,   # How many nanoseconds is the waiting time for test's answer
                "retries": 10, # How many times test is executed
                "start_period": 15_000_000_000,  # How many nanoseconds is the waiting time before first test
            }
        }

        #Case host machine has a NVDIA GPU
        if settings.GPU_AVAILABLE == "1":
            container_kwargs.update({ 
                "environment": {
                    "NVIDIA_VISIBLE_DEVICES": "all",
                    "NVIDIA_DRIVER_CAPABILITIES": "all",
                },
                "device_requests": [
                    {
                        "count": 1,
                        "capabilities": [["gpu"]]
                    }
                ]
            })
            
            print("---------------")
            print("GPU NVIDIA detected: using suport.")
            print("---------------")
        else:
            print("---------------")
            print("GPU NVIDIA not detected: continuing without GPU's SUPORT.")
            print("---------------")
        

        #On developemnt, this allow all changes in host's file manager_dev.sh
        #be send to container respective file
        if settings.PRODUCTION == False:
            container_kwargs["volumes"][str(f"{entrypoints_path}/manager_dev.sh")] = {
                'bind': '/opt/manager_dev.sh',
                'mode': 'rw'
            }
            container_kwargs["entrypoint"] = "/opt/manager_dev.sh"
        
        # if settings.PRODUCTION == True:
        #     project_name = settings.COMPOSE_PROJECT_NAME
        #     container_kwargs["network"] = f"{project_name}_user-network"

        # Creates a new container with random external ports
        container = client.containers.run(**container_kwargs)

        #Verify if container is healthy for 80 seconds
        wait_until_healthy(container, 80)
        
        container.reload()
        
        # Get extenals ports assign by Docker
        port_bindings = container.attrs['NetworkSettings']['Ports']
        
        # Extract ports
        assigned_ports = {
            'manager': int(port_bindings['7163/tcp'][0]['HostPort']),
            'gazebo': int(port_bindings['6080/tcp'][0]['HostPort']),
            'console': int(port_bindings['1108/tcp'][0]['HostPort']),
        }
        
        return {
            'success': 1,
            'container_name': container_name,
            'ports': assigned_ports,
        }
    
    except Exception as e:
        return {
            'success': 0,
            'status': 'error',
            'error_type': type(e).__name__,
            'error_message': str(e)
        }

def deleteUserContainer(user_id):
    try:
        client = docker.from_env()
        container_name = CONTAINER_BASE_NAME + str(user_id)
        network_name = DOCKER_NETWORK_BASE_NAME + str(user_id)

        # Try to get container
        try:
            container = client.containers.get(container_name)
            
            # Stop and remove container
            container.stop(timeout=5)
            container.remove(force=True)
            
            network = client.networks.get(network_name)
            network.remove()
            return {
                'success': 1,
                'message': f'Container {container_name} was removed'
            }
            
        except docker.errors.NotFound:
            return {
                'success': 1,
                'message': f'Container already deleted'
            }
            
    except Exception as e:
        return {
            'success': 0,
            'status': 'error',
            'error_type': type(e).__name__,
            'error_message': str(e)
        }

def delete_old_container(client, container_name, network_name):
        # Removes a container with same name
        try:
            old_container = client.containers.get(container_name)
            old_container.stop()
            old_container.remove(force=True)
        except docker.errors.NotFound:
            pass  # Container didn't exists

        #Removes a network with same name
        try:
            old_network = client.networks.get(network_name)
            old_network.remove()
        except docker.errors.NotFound:
            pass
    
def wait_until_healthy(container, timeout=30):
   
    start_time = time.time()
    while time.time() - start_time < timeout:
        container.reload()
        state = container.attrs.get("State", {})
        health = state.get("Health", {})
        status = health.get("Status")

        if status == "healthy":
            print("Container is healthy.")
            return

        if status == "unhealthy":
            raise Exception("Container is unhealthy")

        print(f"Waiting container become healthy... Status: {status}")
        time.sleep(1)

    raise Exception("Timeout: container don't become healthy in time.")