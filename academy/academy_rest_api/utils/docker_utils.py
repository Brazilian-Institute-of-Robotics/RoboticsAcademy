import docker
import time
from django.conf import settings
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

CONTAINER_BASE_NAME = "manager_container_user_"

def startUserContainer(user_id):
    try:
        client = docker.from_env()

        # Verify if image exists
        try:
            client.images.get('jderobot/robotics-academy:test')
        except docker.errors.ImageNotFound:
            return {
                'success': 0,
                'message': 'Docker image not found at server'
            }

        # Unique name to user's container
        container_name = CONTAINER_BASE_NAME + str(user_id)
        
        # Removes a container with same name
        try:
            old_container = client.containers.get(container_name)
            old_container.stop()
            old_container.remove(force=True)
        except docker.errors.NotFound:
            pass  # Container não existia, tudo bem
        
        src_path = "/home/rafaelpalma/git-repositories/cimatec-academy/src"

        #Container's expiration in hours
        expiration = settings.USER_CONTAINER_EXPIRATION

        #Generate expiration datetime
        expires_at = (datetime.now(ZoneInfo("America/Sao_Paulo")) + timedelta(hours=expiration)).isoformat()

        # Creates a new container with random external ports
        container = client.containers.run(
            image="jderobot/robotics-academy:test",
            name=container_name,
            network="cimatec-academy_user-network",
            command="-s",  # Default command
            ports={
                '7163/tcp': None,
                '6080/tcp': None,
                '1108/tcp': None,
            },
            volumes={
                str(src_path): {'bind': '/RoboticsApplicationManager', 'mode': 'rw'},
            },
            labels={
                'expired_at': expires_at,
            },
            detach=True,
            tty=True,
            stdin_open=True,
        )

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
        return {'success': 0, 'message': str(e)}

def deleteUserContainer(user_id):
    try:
        client = docker.from_env()
        container_name = CONTAINER_BASE_NAME + str(user_id)
        
        # Try to get container
        try:
            container = client.containers.get(container_name)
            
            # Stop and remove container
            container.stop(timeout=5)
            container.remove(force=True)
            
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
            'message': str(e)
        }