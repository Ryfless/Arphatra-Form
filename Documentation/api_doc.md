# Data Models

### 1. Collection: users
```
{
    "user_id": "auto-generated",
    "name": "Sandra Gartman",
    "email": "sigma67@gmail.com",
    "password": "hash",
    "created_at": TIMESTAMP
}
```

### 2. Collection: forms
```
{
    "form_id": "auto-generated",
	"user_id": "auto-generated",
	"title": "Quiz aljabar", 
	"banner": image.com,
	"description": "lorem ipsum dolor sit amet",
	"created at": TIMESTAMP,
	"last_opened": TIMESTAMP,

	"public_url": arphatra.com/xxxx,
	"edit_url": arphatra.com/xxxx/edit,
	
	"fields": [
        {
            "field_id": "fld01",
            "label": "lorem ipsum",
            "type": "short_text",
            "required": true
		},
        {
            "field_id": "fld02",
            "label": "lorem ipsum",
            "type": "checkbox",
            "option": ["lorem", "ipsum"],
            "required": true
		},
        {
            "field_id": "fld03",
            "label": "lorem ipsum",
            "type": "rating",
            "range": [0, 10],
            "required": false
        },
        {
            "field_id": "fld04",
            "label": "lorem ipsum",
            "type": "upload",
            "file_type": ["doc", "audio"]
            "required": false
        }
    ]
}
```

### 3. Collection: responses
```
{
	"response_id": "auto-generated",
	"form_id": "auto-generated",
	"submitted_at": TIMESTAMP,
	"fields": [
        "fld01": "lorem ipsum dolor sit amet",
        "fld02": ["lorem"],
        "fld03": [1, 5],
        "fld04": ["gdocs.com", "mangoaudio.net"]
	]
}
```