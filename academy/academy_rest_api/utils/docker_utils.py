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

        # Unique name to user's container
        container_name = CONTAINER_BASE_NAME + str(user_id)
        
        # Removes a container with same name
        try:
            old_container = client.containers.get(container_name)
            old_container.stop()
            old_container.remove(force=True)
        except docker.errors.NotFound:
            pass  # Container didn't exists
        
        # Unique name to user's network
        network_name = DOCKER_NETWORK_BASE_NAME + str(user_id)

        #Removes a network with same name
        try:
            old_network = client.networks.get(network_name)
            old_network.remove()
        except docker.errors.NotFound:
            pass

        #Create a exclusive network to this user's container
        user_network = client.networks.create(network_name, driver="bridge")

        #Script used on container's start
        entrypoint_file = "/manager_prod.sh" if settings.PRODUCTION == True else "/manager_dev.sh"

        #Paths necessary to create volumes
        project_absolute_path = settings.PROJECT_ABSOLUTE_PATH
        src_path = project_absolute_path+"/src"
        entrypoints_path = f"{project_absolute_path}/scripts/RADI/entrypoints"

        #Container's expiration in hours
        expiration = settings.USER_CONTAINER_EXPIRATION

        #Generate expiration datetime
        expires_at = (datetime.now(ZoneInfo("America/Sao_Paulo")) + timedelta(hours=expiration)).isoformat()

        container_kwargs = {
            "image": IMAGE_NAME,
            "name": container_name,
            "network": network_name,
            "nano_cpus": 2000000000,  # 2 núcleos completos
            "ports": {
                '7163/tcp': None,
                '6080/tcp': None,
                '1108/tcp': None,
            },
            "labels": {
                'expired_at': expires_at,
            },
            "volumes": {
                #str(src_path): {'bind': '/RoboticsApplicationManager', 'mode': 'rw'}
            },
            "entrypoint": entrypoint_file,
            "detach": True,
            "tty": True,
            "stdin_open": True,
            "devices": ["/dev/dri"],
        }

        #Case host machine has a NVDIA GPU
        if settings.GPU_AVAILABLE == "1":
            container_kwargs.update({
                "nano_cpus": 2000000000,  # Container can only use 2 CPU'S cores from host
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
            container_kwargs["entrypoint"] = "/opt/manager_dev.sh"
            container_kwargs["volumes"] = {
                str(f"{entrypoints_path}/manager_dev.sh"): {
                    'bind': '/opt/manager_dev.sh',
                    'mode': 'rw'
                }
            }
        
        # if settings.PRODUCTION == True:
        #     project_name = settings.COMPOSE_PROJECT_NAME
        #     container_kwargs["network"] = f"{project_name}_user-network"

        # Creates a new container with random external ports
        container = client.containers.run(**container_kwargs)

        #Wait container be inicialized for 5 seconds at most
        max_attempts = 10
        for _ in range(max_attempts):
            container.reload()
            if container.status == 'running':
                # Verify if external ports is already maped
                if 'NetworkSettings' in container.attrs:
                    break
            time.sleep(0.5)
        else:
            raise Exception("Fail to inicialize user's container")
        
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