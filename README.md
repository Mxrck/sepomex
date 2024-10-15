# SEPOMEX Static API

### ¿Porqué existe esta API?

Trabajando en múltiples proyectos siempre me vi en la necesidad de re-implementar cada vez un importador de los datos de
SEPOMEX,
los cuales con el tiempo quedaban desactualizados. De esta forma y viendo que me tocaría implementarlo una vez más,
decidí crear una api estática utilizando Astro y devolviendo los datos tal cual están en el archivo de texto de SEPOMEX
para que otros desarrolladores puedan usarlo como les sea conveniente.

El código será open source para quien quiera encargarse de montarlo y mantenerlo actualizado en su propio servidor,
por mi parte trataré de actualizarlo al menos 1 vez al mes.

### ¿Cómo funciona?

Utilizando el archivo de texto de SEPOMEX, se extraen los datos de los municipios y estados, y se crean los archivos
json
de cada código postal.

Se pueden crear diferentes versiones y una versión "latest" por si siempre se quiere utilizar la última versión cargada.

## Endpoints

### Lista de versiones

```
https://sepomex.nitrostudio.com.mx/api/versions.json
```

Ejemplo de respuesta:

```json
{
  "data": {
    "versions": [
      {
        "version": "20240120",
        "date": "20/01/2024",
        "is_latest": false,
        "endpoint": "/api/20240120.json"
      },
      {
        "version": "20240320",
        "date": "20/03/2024",
        "is_latest": false,
        "endpoint": "/api/20240320.json"
      },
      {
        "version": "20241009",
        "date": "09/10/2024",
        "is_latest": true,
        "endpoint": "/api/20241009.json"
      }
    ]
  }
}
```

### Lista de estados

```
https://sepomex.nitrostudio.com.mx/api/{VERSION}.json
```

Ejemplo de respuesta:

```json
{
  "data": {
    "states": [
      {
        "c_estado": "01",
        "d_estado": "Aguascalientes",
        "endpoint": "/api/20241009/estado/01.json"
      },
      {
        "c_estado": "02",
        "d_estado": "Baja California",
        "endpoint": "/api/20241009/estado/02.json"
      },
      ...,
      {
        "c_estado": "31",
        "d_estado": "Yucatán",
        "endpoint": "/api/20241009/estado/31.json"
      },
      {
        "c_estado": "32",
        "d_estado": "Zacatecas",
        "endpoint": "/api/20241009/estado/32.json"
      }
    ]
  }
}
```

### Lista de municipios

```
https://sepomex.nitrostudio.com.mx/api/{VERSION}/estado/{ESTADO}.json
```

Ekemplo de respuesta:

```json
{
  "data": {
    "c_estado": "04",
    "d_estado": "Campeche",
    "total_records": 1289,
    "municipios": [
      {
        "c_mnpio": "002",
        "d_mnpio": "Campeche",
        "endpoint": "/api/20241009/estado/04/municipio/002.json"
      },
      ...,
      {
        "c_mnpio": "013",
        "d_mnpio": "Dzitbalché",
        "endpoint": "/api/20241009/estado/04/municipio/013.json"
      }
    ],
    "postcodes": [
      {
        "d_codigo": "24000",
        "d_asenta": "San Francisco de Campeche Centro",
        "d_tipo_asenta": "Colonia",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "San Francisco de Campeche",
        "d_cp": "24003",
        "c_estado": "04",
        "c_oficina": "24003",
        "c_cp": "",
        "c_tipo_asenta": "09",
        "c_mnpio": "002",
        "id_asenta_cpcons": "0001",
        "d_zona": "Urbano",
        "c_cve_ciudad": "01",
        "endpoint": "/api/20241009/cp/24000.json"
      },
      ...,
      {
        "d_codigo": "24940",
        "d_asenta": "San Roque Xnolán",
        "d_tipo_asenta": "Ejido",
        "d_mnpio": "Calkiní",
        "d_estado": "Campeche",
        "d_ciudad": "",
        "d_cp": "24901",
        "c_estado": "04",
        "c_oficina": "24901",
        "c_cp": "",
        "c_tipo_asenta": "15",
        "c_mnpio": "001",
        "id_asenta_cpcons": "1114",
        "d_zona": "Rural",
        "c_cve_ciudad": "",
        "endpoint": "/api/20241009/cp/24940.json"
      }
    ]
  }
}
```

### Lista de municipios

```
https://sepomex.nitrostudio.com.mx/api/{VERSION}/estado/{ESTADO}/municipio/{MUNICIPIO}.json
```

Ejemplo de respuesta:

```json
{
  "data": {
    "c_estado": "04",
    "d_estado": "Campeche",
    "c_mnpio": "002",
    "d_mnpio": "Campeche",
    "total_records": 318,
    "postcodes": [
      {
        "d_codigo": "24000",
        "d_asenta": "San Francisco de Campeche Centro",
        "d_tipo_asenta": "Colonia",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "San Francisco de Campeche",
        "d_cp": "24003",
        "c_estado": "04",
        "c_oficina": "24003",
        "c_cp": "",
        "c_tipo_asenta": "09",
        "c_mnpio": "002",
        "id_asenta_cpcons": "0001",
        "d_zona": "Urbano",
        "c_cve_ciudad": "01",
        "endpoint": "/api/20241009/cp/24000.json"
      },
      ...,
      {
        "d_codigo": "24575",
        "d_asenta": "Adolfo Ruiz Cortinez",
        "d_tipo_asenta": "Ejido",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "",
        "d_cp": "24571",
        "c_estado": "04",
        "c_oficina": "24571",
        "c_cp": "",
        "c_tipo_asenta": "15",
        "c_mnpio": "002",
        "id_asenta_cpcons": "0418",
        "d_zona": "Rural",
        "c_cve_ciudad": "",
        "endpoint": "/api/20241009/cp/24575.json"
      }
    ]
  }
}
```

### Lista de códigos postales

```
https://sepomex.nitrostudio.com.mx/api/{VERSION}/cp/{CODIGO_POSTAL}.json
```

Ejemplo de respuesta:

```json
{
  "data": {
    "total_records": 3,
    "postcodes": [
      {
        "d_codigo": "24040",
        "d_asenta": "San José",
        "d_tipo_asenta": "Barrio",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "San Francisco de Campeche",
        "d_cp": "24003",
        "c_estado": "04",
        "c_oficina": "24003",
        "c_cp": "",
        "c_tipo_asenta": "02",
        "c_mnpio": "002",
        "id_asenta_cpcons": "0046",
        "d_zona": "Urbano",
        "c_cve_ciudad": "01"
      },
      {
        "d_codigo": "24040",
        "d_asenta": "San Román",
        "d_tipo_asenta": "Barrio",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "San Francisco de Campeche",
        "d_cp": "24003",
        "c_estado": "04",
        "c_oficina": "24003",
        "c_cp": "",
        "c_tipo_asenta": "02",
        "c_mnpio": "002",
        "id_asenta_cpcons": "0047",
        "d_zona": "Urbano",
        "c_cve_ciudad": "01"
      },
      {
        "d_codigo": "24040",
        "d_asenta": "Privada Narciso Mendoza",
        "d_tipo_asenta": "Fraccionamiento",
        "d_mnpio": "Campeche",
        "d_estado": "Campeche",
        "d_ciudad": "San Francisco de Campeche",
        "d_cp": "24003",
        "c_estado": "04",
        "c_oficina": "24003",
        "c_cp": "",
        "c_tipo_asenta": "21",
        "c_mnpio": "002",
        "id_asenta_cpcons": "1031",
        "d_zona": "Urbano",
        "c_cve_ciudad": "01"
      }
    ]
  }
}
```

### Errores

Al ser una api estática, siempre se devuelve un código 200 y el contenido en json, en caso de que el código postal no
exista, se
devuelve un código 404 y el contenido en json.

```
https://sepomex.nitrostudio.com.mx/api/{VERSION}/cp/99999.json
```

Ejemplo de respuesta:

```json
{
  "data": {
    "error": "Not found",
    "data": null
  }
}
```

## Build manual

### Requisitos

- Node.js 18.x
- pnpm
- mongodb (se usa de apoyo)
- redis/garnet (se usa de apoyo)
- docker (opcional)

### Instalación

```sh
pnpm install
```

### Build

Copiar el archivo `.env.example` a `.env` y modificarlo según sea necesario:

* DEBUG_DATA="true":
    - Limpia los datos de la base de datos antes de crear los nuevos registros (de momento es necesario, ya que no se
      consideran los registros que ya existen)
* BATCH_MODE="true"
    - Crea los registros de la base de datos en lotes
* EXCLUDE_LATEST_VERSION="true"
    - No crear los registros de la versión "latest", al habilitar esto se evitará la creación de la versión "latest" (
      evita crear una copia adicional), en el caso de optar por docker, la imagen latest usará los mismos archivos de la
      versión marcada como "latest" sin generar los archivos nuevos
* ACCESS_TOKEN=""
    - Se utiliza para proteger la API, se puede utilizar para limitar el acceso a la API (solo al hacer deploy con
      nginx)

Tardará unos minutos en crear los registros de la base de datos a partir de los archivos de SEPOMEX, esto ayuda al
proceso
de generación de los archivos json estáticos.

```sh
pnpm run build
```

Generará la carpeta `dist` con los archivos json estáticos.

### Build con Docker

Se puede utilizar docker para generar los archivos json estáticos (sin instalar mongo o redis), esto se hace utilizando
el archivo `build.docker-compose.yml`

```sh
docker compose -f build.docker-compose.yml up --build --exit-code-from app --remove-orphans && docker compose -f build.docker-compose.yml down --volumes --remove-orphans
```

## Deploy con docker

Se puede generar una imagen que ya tenga nginx configurado para servir los archivos json estáticos, esto se hace
utilizando el archivo `deploy.Dockerfile`.

Entre las cosas que se automatizan:

* Se configura un rewrite en nginx para la versión "latest" de los archivos json estáticos (sin generar los archivos),
  utilizando solo la versión marcada como "latest" (EXCLUDE_LATEST_VERSION="true")
* Se configura la página de error 404 para que devuelva el contenido en json
* Se configura el header de autorización para que solo se pueda acceder a la API si se envía el token de acceso (solo si
  ACCESS_TOKEN se establece)
    - Se puede generar un token de acceso con el siguiente comando:
      ```sh
      openssl rand -hex 20
      ```

Es necesario que la carpeta `dist` esté presente para que el build funcione correctamente. (paso anterior)

```sh
docker build -f deploy.Dockerfile -t sepomex:latest .
```

Para ejecutar la imagen (cambiar el puerto host por el que consideres):

```sh
docker run -d --name sepomex -p 8080:80 sepomex:latest
```

## Añadir nuevas versiones

Para añadir una nueva versión, se debe descargar el nuevo archivo de sepomex:

```
https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
```

Después modificar el archivo `src/data/sepomex-files/data.json` añadiendo la nueva versión (recuerda actualizar la
variable `is_latest` en la última versión):

```json
[
  ...,
  {
    "day": "20",
    "month": "01",
    "year": "2024",
    "filename": "20240120.txt",
    "encoding": "latin1",
    "is_latest": true
  }
]
```

Y ejecutar el proceso de build y deploy.

## Próximos pasos

* Generar la landing page para la API
* Generar la documentación de la API
* Implementar la reutilización de los archivos json estáticos para reducir la cantidad de archivos que se generan
* Mejorar el tiempo de generación de los archivos json estáticos
* Eliminar dependencia de mongodb