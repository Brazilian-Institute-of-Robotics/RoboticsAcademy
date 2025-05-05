import docker
import time

CONTAINER_BASE_NAME = "manager_container_user_"

def startUserContainer(user_id):
    try:
        client = docker.from_env()

        # Verifica se a imagem existe no host
        try:
            client.images.get('jderobot/robotics-academy:test')
        except docker.errors.ImageNotFound:
            return {
                'success': 0,
                'message': 'Docker image not found at server'
            }

        # Nome único para o container do usuário
        container_name = CONTAINER_BASE_NAME + str(user_id)
        
        # Remove container existente (se houver)
        try:
            old_container = client.containers.get(container_name)
            old_container.stop()
            old_container.remove(force=True)
        except docker.errors.NotFound:
            pass  # Container não existia, tudo bem
        
        src_path = "/home/rafaelpalma/git-repositories/cimatec-academy/src"
        
        # Cria um novo container com portas dinâmicas
        container = client.containers.run(
            image="jderobot/robotics-academy:test",
            name=container_name,
            command="-s",  # Comando padrão do seu container
            ports={
                '7163/tcp': None,
                '6080/tcp': None,
                '1108/tcp': None,
            },
            volumes={
                str(src_path): {'bind': '/RoboticsApplicationManager', 'mode': 'rw'},
            },
            detach=True,
            tty=True,
            stdin_open=True,
        )

        #Aguarda o container estar totalmente inicializado em até 5 segundos
        max_attempts = 10
        for _ in range(max_attempts):
            container.reload()
            if container.status == 'running':
                # Verifica se as portas já foram mapeadas
                if 'NetworkSettings' in container.attrs:
                    break
            time.sleep(0.5)
        else:
            raise Exception("Timeout ao aguardar inicialização do container manager do usuário")
        
        # Atualiza o container para obter as portas mapeadas
        container.reload()
        
        # Obtém as portas atribuídas pelo Docker
        port_bindings = container.attrs['NetworkSettings']['Ports']
        
        # Extrai as portas externas
        assigned_ports = {
            'manager': port_bindings['7163/tcp'][0]['HostPort'],
            'gazebo': port_bindings['6080/tcp'][0]['HostPort'],
            'console': port_bindings['1108/tcp'][0]['HostPort'],
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
        
        # Tentar obter o container
        try:
            container = client.containers.get(container_name)
            
            # Forçar parada e remoção
            container.stop(timeout=5)
            container.remove()
            
            return {
                'success': 1,
                'message': f'Container {container_name} removido com sucesso'
            }
            
        except docker.errors.NotFound:
            return {
                'success': 1,
                'message': f'Container já foi deletado'
            }
            
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }