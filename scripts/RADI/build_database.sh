DOCKERFILE="Dockerfile_database.humble"

# Build the Docker image
echo "===================== BUILDING RoboticsDatabase ====================="
echo "Building RoboticsDatabase using $DOCKERFILE"

docker build -f $DOCKERFILE -t rasc_academy_db .