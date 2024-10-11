# Levanta los servicios y elimina los contenedores después de que el contenedor "app" termine
docker compose -f build.docker-compose.yml up --build --exit-code-from app --remove-orphans

# Elimina todos los contenedores
docker compose -f build.docker-compose.yml down --volumes --remove-orphans