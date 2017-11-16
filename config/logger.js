var config = {
    "appenders": [
        {
            "category": "console",
            "type": "console"
        },
        {
            "category": "access",
            "type": "file",
            "filename": "logs/access.log",
            "maxLogSize": 100*1024*1024, // = 100Mb
            "backups": 10
        },
        {
            "category": "messages",
            "type": "file",
            "filename": "logs/messages.log",
            "maxLogSize": 100*1024*1024, // = 100Mb
            "backups": 10
        }
    ]
}
module.exports = config;