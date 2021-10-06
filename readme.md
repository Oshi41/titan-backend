# Описание

Продукт представляет из себя веб сервис, ответственный за хранение пользователей.

Текущая версия API - 1.0

# Настройка приложения

Файл настройки приложения создается по дефолтным данным и лежит в корне с именем `_config.json`.
~~~~
{
  // Порт, на котором будет запущено приложение  
  "port": 5001,
  
  // алгоритм шифрования пароля
  "digest": "md5" | "plain",
  
  // тип хранилища учеток пользователей
  // Данные учеток лежат в папке ./store
  // в отдельном файле по каждому типу хранилища
  "store": "sqlite"
}
~~~~


# API

### Register

Осуществляет регистрацию пользователя.

~~~~
Post
/api/ВЕРСИЯ/register

Payload:
{
    "login": "ИМЯ_ПОЛЬЗОВАТЕЛЯ",
    "pass": "ПАРОЛЬ"
}
~~~~

Ответ
~~~~

Если успешно:
200
success

Вохможные ошибки:

404:
No login provided
Password is empty or less than 5 symbols length
already taken

505:
error in database
~~~~

## Login

Проверяет свободно ли имя пользователя.

~~~~
Get
/api/ВЕРСИЯ/login?login=ИМЯ_ПОЛЬЗОВАТЕЛЯ&pass=ПАРОЛЬ

Query params:
login: "ИМЯ_ПОЛЬЗОВАТЕЛЯ"
pass: "ПАРОЛЬ"
~~~~

Ответ

~~~~

Если зарегестрированы:
OK:ИМЯ_ПОЛЬЗОВАТЕЛЯ

Если нет какого-то параметра
401

Если логин/пароль не совпадает
403
wrong login or pass
~~~~

## Busy

Проверяет свободно ли имя пользователя.

~~~~
Get
/api/ВЕРСИЯ/busy?login=ИМЯ_ПОЛЬЗОВАТЕЛЯ

Query params:
login: "ИМЯ_ПОЛЬЗОВАТЕЛЯ"
~~~~

Ответ

~~~~

Если имя уже занято:
200
busy

Если имя свободно:
200
free

Возможные ошибки будут с кодом 400
~~~~

## Download

Скачивает разрешенные файлы с сервера. 
Задаётся только имя файла, если в конфиге сервера
такой файл присутствует, его можно скачать.

~~~~
Get
/api/ВЕРСИЯ/download?file=ФАЙЛ

Query params:
file: "ИМЯ_ФАЙЛА"
~~~~

Ответ

~~~~

Ошибка в запросе либо файл скачать нельзя
403

Если файл не найден
404

200, если отправлен файл
~~~~

## minecraftServer

Запрашивает данные для сервера

~~~~
Get
/api/ВЕРСИЯ/minecraftServer?server=АДРЕС_СЕРВЕРА

Query params:
server: "АДРЕС_СЕРВЕРА"
~~~~

Ответ

~~~~

{
    "server": {
        "servericon": "https://some-url.ru",
        "ip": "11.222.333.444",
        "port": 68999,
        "debug": {
            "ping": true,
            "query": true,
            "srv": false,
            "querymismatch": false,
            "ipinsrv": false,
            "cnameinsrv": false,
            "animatedmotd": false,
            "cachetime": 0,
            "apiversion": 2
        },
        "motd": {
            "raw": [
                "§9§lОписание",
                "2"
            ],
            "clean": [
                "Описание",
                "в 2 строчки"
            ],
            "html": [
                "<span style=\"color: #5555FF\"><span style=\"font-weight: bold;\">Описание</span></span>",
            ]
        },
        "players": {
            "online": 2,
            "max": 50
        },
        "version": "1.7.10",
        "online": true,
        "protocol": 5,
        "hostname": "minecraft.server.ru"
    },
    "forge": {
        "description": "Определение",
        "players": {
            "max": 50,
            "online": 2,
            "sample": [
                {
                    "id": "2eec20db-1111-2222-3333-0cc47a029c48",
                    "name": "firstUser"
                },
                {
                    "id": "e798806d-4444-5555-6666-0cc47a029c48",
                    "name": "secondUser"
                }
            ]
        },
        "version": {
            "name": "1.7.10",
            "protocol": 5
        },
        "favicon": "data:image/(...)",
        "modinfo": {
            "type": "FML",
            "modList": [
                {
                    "modid": "[mcp] 9.05",
                    "version": "ПУТЬ К САЙТУ МОДА"
                },
                {
                    "modid": "[FML] 7.10.99.99",
                    "version": "ПУТЬ К САЙТУ МОДА"
                },
                {
                    "modid": "[Forge] 10.13.4.1614",
                    "version": "ПУТЬ К САЙТУ МОДА"
                },
            ]
        },
        "latency": 60
    }
}
~~~~

## myServers
Запрос адресов всех серверов, которые поддерживаются мной

~~~~
Get
/api/ВЕРСИЯ/myServers
~~~~
Ответ

~~~~
[
    "minecraft.server.ru",
    "minecraft.server2.ru",
]
~~~~

## storeType
Тип хранения запроса

~~~~
Get
/api/ВЕРСИЯ/storeType
~~~~
Ответ

~~~~
'sqlite' | 'ely.by'
~~~~


# Хранение паролей

Для хранения паролей поддерживаются несколько типов шифрования:

`md5` - хранится хэш-сумма пароля

`plain` - хранится пароль в чистом виде, не шифрованный

# Хранение учёток пользователей

Для учетных записей поддерживаются следующие типы хранилища:

`sqlite` - хранение данных в SqLite базе данных