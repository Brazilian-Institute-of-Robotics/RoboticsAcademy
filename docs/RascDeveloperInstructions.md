### [Back to main README.][]

[Back to main README.]: ../README.md

# Instructions for developers

ATTENTION: Docker is necessary to use this application

- [Clone required repositories](#clone-required-repositories)
- [Create .env on RascAcademy](#create-env-on-rascacademy)
- [Build RascAcademy's docker images](#build-rascacademys-docker-images)
- [Build package CustomRobots on RascInfrastructure](#build-package-customrobots-on-rascinfrastructure)

## Clone required repositories

- [RascInstructionsPages](#rascinstructionspages)
- [RascInfrastructure](#rascinfrastructure)
- [RascAcademy](#rascacademy)


### RascInstructionsPages

This branch (gh-pages-docker) of repository RoboticsAcademy contains all pages of instructions for each exercise. Before clone it, It's need to install Ruby and Jekyll.

1) Install Ruby dependencies
```
sudo apt-get install ruby-full build-essential zlib1g-dev
```

2) Set up directory for gems's installations
```
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

3) Install Jekyll
```
gem install jekyll bundler
```

4) Clone RoboticsAcademy's repository
```
git clone https://github.com/Brazilian-Institute-of-Robotics/RoboticsAcademy.git RascInstructionsPages
```

5) Enter the repository and change to branch gh-pages-docker
```
git checkout gh-pages-docker
```

To verify if worked, execute inside repository the command bellow and after that click [here](http://localhost:4000/exercises/)
```
./scripts/develop.sh
```

### RascInfrastructure

This repository contains all files used to create exericses's simulations.

1) Clone repository
```
git clone https://github.com/Brazilian-Institute-of-Robotics/RoboticsInfrastructure.git RascInfrastructure
```

2) Enter repository and change to branch feat-add-world-launch
```
git checkout feat-add-world-launch
```

### RascAcademy

Inside this branch there is the RASC-ACADEMY's application.

1) Clone repository
```
git clone https://github.com/Brazilian-Institute-of-Robotics/RoboticsAcademy.git RascAcademy
```

2) Enter repository and change to branch isolate-webapp
```
git checkout isolate-webapp
```
## Create .env on RascAcademy

In RascAcademy's root, copy the content of .env.example, create .env and paste on it. Inside .env you must change the values of 3 variables:

- PROJECT_ABSOLUTE_PATH : Receives absolute path of RascAcademy in your PC
- INFRASTRUCTURE_ABSOLUTE_PATH : Receives absolute path of RascInfrastructure in your PC
- GUIDE_PAGES_ABSOLUTE_PATH : Receives absolute path of RascInstructionsPages in your PC

## Build RascAcademy's docker images

1) On RascAcademy's root, enter in RADI folder
```
cd scripts/RADI
```

2) Build webapp image (will take a while)

```
./build_webapp.sh -a isolate-webapp
```

3) Build manager image (will take a while too)

```
./build_manager.sh -i feat-add-world-launch
```

## Build package CustomRobots on RascInfrastructure

ATTENTION: Make sure you executed previous section's commands, because in this step the manager image is needed

This package hava all models and meshes used on simulators, so we need to build it to make all of them accessible to manager containers. On RascInfrastructure's root, execute:

```
chmod +x scripts/build_custom_robots.sh
./scripts/build_custom_robots.sh
```

## Starts RascAcademy

On RascAcademy's root, execute command bellow and after initialized click [here](http://localhost:7164).

```
sh scripts/develop_academy.sh
```

To login, user this credential
```
user: user
password: pass
```

To stop application, use Ctrl + c on terminal

## Starts RascInstructionsPage

On RascInstructionsPage's roots, executes command bellow an than  click [here](http://localhost:4000/exercises/) to access page
```
./scripts/develop.sh
```


