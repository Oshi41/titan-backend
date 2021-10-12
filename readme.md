# Описание

Продукт представляет собой веб сервис, ответственный за регистрацию и хранение пользователей. Так же поддерживает Mojang
API для автоматического входа на Minecraft сервер по базе данных с существующими пользователями.

https://github.com/yushijinhun/authlib-injector

Текущая версия API - 1.0

# Настройка приложения

Файл настройки приложения создается по дефолтным данным и лежит в `_Storage/_config.json`.

~~~~
{
  // Порт, на котором будет запущено приложение  
  "port": 80,
  
  // алгоритм шифрования пароля
  "passEncrypt": "md5" | "plain",
  
  // Макс. кол-во пользователей, зарегестрированных 
  // на одном IP адресе
  "maxUsersPerIP": 3
}
~~~~

### Генерация сертификата
https://stackoverflow.com/questions/11744975/enabling-https-on-express-js

Для работы на https необходим сертификат. Для этого откройте терминал,
перейдите в корень и запустите:

~~~~
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./_storage/ssl/selfsigned.key -out ./_storage/ssl/selfsigned.cert
~~~~

Далее следуйте инструкции


# Endpoint /yggdrasil

### authserver/authenticate

https://wiki.vg/Authentication#Authenticate

Реализует протокол аутентификации. Необходим для настройки лаунчера https://launcher-sashok724.keeperjerry.ru. Endpoint
ответит согласно имеющимся данным в БД

~~~~
authProvider: "authlib";
    authProviderConfig: {
        authUrl: "http://ADDRESS/yggdrasil/authserver/authenticate";
};
~~~~

~~~
POST
{
    // Эта часть не меняется
    "agent": {                              
        "name": "Minecraft",                
        "version": 1                        
                                           
    },
    // Login игрока
    "username": "mojang account name",      
                                            
    // Пароль игррока                                        
    "password": "mojang account password",
    
    // Сгенерированный токен клиента
    "clientToken": "client identifier",
         
    "requestUser": true                     
}

Ответ (привожу не полностью, т.к. он не весь нужен)
{
    // Отсюда удаляем все тире!!!
    // Не 
    // e0148d30-b5d8-49ad-86b6-491a99646a64
    // а
    // e0148d30b5d849ad86b6491a99646a64
    //
    "clientToken": "client identifier",
    
    // Тут можно что угодно закинуть
    "accessToken": "random access token",
    
    "selectedProfile": {
        "name": "Имя игрока",
        
        // Отсюда удаляем все тире!!!
        // Не 
        // e0148d30-b5d8-49ad-86b6-491a99646a64
        // а
        // e0148d30b5d849ad86b6491a99646a64
        //
        "id": "hexadecimal string" // UUID of the account
    }
}
~~~


### /sessionserver/session/minecraft/join

https://wiki.vg/Protocol_Encryption#Client

Вызывается сервером при подключении клиента (handshake). Нужно сохранить состояние 
в БД, потому что игрок готов зайти на сервер.  Эта настройка и ниже отвечает за
вход на сервер. Если используем авторизацию лаун сервера, надо указать следующее

~~~
authHandler: "authlib";
authHandlerConfig: {
    joinUrl: "http://ADDRESS/yggdrasil/session/minecraft/join";
    hasJoinUrl: "http://ADDRESS/yggdrasil/session/minecraft/hasJoined";
};
~~~


~~~
POST
{
    // Тут снова приходит uuid без тире
    "accessToken": "<accessToken>",
    
    // Тут снова приходит uuid без тире
    "selectedProfile": "<player's uuid without dashes>",
    
    // ID сервера, на который зашли
    // Поле сохраняется в БД, по сл. запрос проверяется по нему 
    "serverId": "<serverHash>"
}

Ответ (снова привожу не полностью)
{
    // Отправляем ID игрока
    "id": "<profile identifier>",
    
    // Логин игррока
    "name": "<player name>",
}
~~~

### /sessionserver/session/minecraft/hasJoined

https://wiki.vg/Protocol_Encryption#Server

Получаю подтверждение, что могу зайти на сервер. Финальная часть, после которой 
захожу на сервер.
~~~
GET https://sessionserver.mojang.com/session/minecraft/hasJoined?username=username&serverId=hash&ip=ip

Ответ (не полностью)
{
    // uuid игрока
    "id": "<profile identifier>",
    
    // его логин
    "name": "<player name>",
}
~~~

# authlib-injector

https://github.com/yushijinhun/authlib-injector/releases

С его помощью можно настроить работу любых сборок, потому что у авторов лаунч 
серверов не всегда есть некоторые сборки. Подробнее - в вики.

Пример запуска

`java -javaagent:authlib-injector.jar=http://ADDRESS/yggdrasil -jar minecraft_server.1.7.10.jar nogui`



# Endpoint /api/ВЕРСИЯ

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

Если успешно, то вернет uuid пользователя
200
12345678-1234-1234-1324-123456789012

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

Скачивает разрешенные файлы с сервера. Задаётся только имя файла, если в конфиге сервера такой файл присутствует, его
можно скачать.

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

## server

Запрашивает данные для сервера

~~~~
Get
/api/ВЕРСИЯ/server?address=АДРЕС_СЕРВЕРА

Query params:
address: "АДРЕС_СЕРВЕРА"
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

## ownServers

Запрос адресов всех серверов, которые поддерживаются мной

~~~~
Get
/api/ВЕРСИЯ/ownServers
~~~~

Ответ

~~~~
[
    "minecraft.server.ru",
    "minecraft.server2.ru",
    "192.85.12.2"
]
~~~~

# Хранение паролей

Для хранения паролей поддерживаются несколько типов шифрования:

`md5` - хранится хэш-сумма пароля

`plain` - хранится пароль в чистом виде, не шифрованный

# Ограничение по регистрации

Регистрацию можно ограничить числом учёток на IP. По умолчанию - 3. Если выставить
< 0, считаем, что ограничений нет. 0 - отключить регистрацию.