---
#DO NOT CHANGE THE 3 LINES BELOW
permalink: /exercises/{CATEGORY_INDENTIFY}/{EXERCISE_ID}
title: "{EXERCISE_NAME}"
toc_label: "TOC {EXERCISE_NAME}"

toc: true
toc_icon: "cog"

sidebar:
  nav: "docs"

youtubeId1: ve9USu7zpLU
---

## Goal

"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


<img src="/assets/images/exercises/model_exercises/model_exercises_teaser.png" width="100%" height="60%">


## Robot API

* `import HAL` - to import the HAL(Hardware Abstraction Layer) library class. This class contains the functions that sends and receives information to and from the Hardware(Gazebo).
* `import GUI` - to import the GUI(Graphical User Interface) library class. This class contains the functions used to view the debugging information, like image widgets.
* `HAL.getPose3d().x` - to get the position of the robot (x coordinate)
* `HAL.getPose3d().y` - to obtain the position of the robot (y coordinate)
* `HAL.getPose3d().yaw` - to get the orientation of the robot with
  regarding the map
* `HAL.getLaserData()` - It allows to obtain the data of the laser sensor, which consists of 180 pairs of values ​​(0-180º, distance in meters).
* `HAL.setV()` - to set the linear speed
* `HAL.setW()` - to set the angular velocity

```python
print ('Execute')

# TODO

print(HAL.getPose3d().x)
print(HAL.getPose3d().y)
# Vacuum's yaw
yaw = HAL.getPose3d().yaw
```

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

- **Laser**

```python
import math
import numpy as np

def parse_laser_data(laser_data):
    """ Parses the LaserData object and returns a tuple with two lists:
        1. List of  polar coordinates, with (distance, angle) tuples,
           where the angle is zero at the front of the robot and increases to the left.
        2. List of cartesian (x, y) coordinates, following the ref. system noted below.

        Note: The list of laser values MUST NOT BE EMPTY.
    """
    laser_polar = []  # Laser data in polar coordinates (dist, angle)
    laser_xy = []  # Laser data in cartesian coordinates (x, y)
    for i in range(180):
        # i contains the index of the laser ray, which starts at the robot's right
        # The laser has a resolution of 1 ray / degree
        #
        #                (i=90)
        #                 ^
        #                 |x
        #             y   |
        # (i=180)    <----R      (i=0)

        # Extract the distance at index i
        dist = laser_data.values[i]
        # The final angle is centered (zeroed) at the front of the robot.
        angle = math.radians(i - 90)
        laser_polar += [(dist, angle)]
        # Compute x, y coordinates from distance and angle
        x = dist * math.cos(angle)
        y = dist * math.sin(angle)
        laser_xy += [(x, y)]
    return laser_polar, laser_xy

# Usage
laser_data = HAL.getLaserData()
if len(laser_data.values) > 0:
    laser_polar, laser_xy = parse_laser_data(laser_data)
```

## Analyzing Coverage Algorithms

### Classification
Coverage algorithms are divided into two categories.

- **Offline coverage**
use fixed information and the environment is known in advance. Genetic Algorithms, Neural Networks, Cellular Decomposition, Spanning Trees are some examples to name a few.

- **Online Coverage**

Uses real-time measurements and decisions to cover the entire area. The Sensor-based approach is included in this category.

### Base Movement

The problem of coverage involves two standard basic motions, which are used as a base for other complex coverage algorithms.

- **Spiral Motion**

The robot follows an increasing circle/square pattern.

![Base Movement Spiral](/assets/images/exercises/vacuum_cleaner/spiral.gif)

- **Boustrophedon Motion**

The robot follows an S-shaped pattern.

![Base Movement Boustrophedon](/assets/images/exercises/vacuum_cleaner/boustrophedon.gif)

### Analysis of Coverage Algorithms

Any coverage algorithm is analyzed using the given criterion.

- **Environment Decomposition**
This involves dividing the area into smaller parts.

- **Sweep Direction**

This influences the optimality of generated paths for each sub-region by adjusting the duration, speed, and direction of each sweep.

- **Optimal Backtracking**

This involves the plan to move from one small subregion to another. The coverage is said to be complete when there is no point left to backtrack.

## Illustrations

{% include gallery id="illustrations" caption="Illustrations" %}

## Videos

{% include youtubePlayer.html id=page.youtubeId1 %}

*This solution is an illustration for the Web Templates*

<br/>

## Contributors

- Contributors: [Vanessa Fernandez](https://github.com/vmartinezf), [Jose María Cañas](https://github.com/jmplaza), [Carlos Awadallah](https://github.com/cawadall), [Nacho Arranz](https://github.com/igarag), [Javier Izquierdo](https://github.com/javizqh).
- Maintained by [Sakshay Mahna](https://github.com/SakshayMahna), [Javier Izquierdo](https://github.com/javizqh).

## References

1. [https://www.researchgate.net/publication/330183516_3D_Computer_Vision_Stereo_and_3D_Reconstruction_from_Disparity](https://www.researchgate.net/publication/330183516_3D_Computer_Vision_Stereo_and_3D_Reconstruction_from_Disparity)
2. [https://www.iitr.ac.in/departments/MA/uploads/Stereo-updated.pdf](https://www.iitr.ac.in/departments/MA/uploads/Stereo-updated.pdf)
3. [https://www.cs.auckland.ac.nz/courses/compsci773s1c/lectures/CS773S1C-3DReconstruction.pdf](https://www.cs.auckland.ac.nz/courses/compsci773s1c/lectures/CS773S1C-3DReconstruction.pdf)
4. [https://cs.nyu.edu/~fergus/teaching/vision/9_10_Stereo.pdf](https://cs.nyu.edu/~fergus/teaching/vision/9_10_Stereo.pdf)
5. [https://mil.ufl.edu/nechyba/www/eel6562/course_materials/t9.3d_vision/lecture_multiview1x2.pdf](https://mil.ufl.edu/nechyba/www/eel6562/course_materials/t9.3d_vision/lecture_multiview1x2.pdf)
6. [https://learnopencv.com/introduction-to-epipolar-geometry-and-stereo-vision/](https://learnopencv.com/introduction-to-epipolar-geometry-and-stereo-vision/)
7. [https://medium.com/@dc.aihub/3d-reconstruction-with-stereo-images-part-1-camera-calibration-d86f750a1ade](https://medium.com/@dc.aihub/3d-reconstruction-with-stereo-images-part-1-camera-calibration-d86f750a1ade)

