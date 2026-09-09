# A FORJA

## Rotas

> **RETORNO DE POST /CLIENT**
```bash
{
	"message": "Usuário criado com sucesso."
}
```

> **RETORNO DE POST /LOGIN**

```bash
{
	"message": "Login realizado com sucesso.",
	"user": {
		"id": "6aa02ce2a8793eafee2a54e6",
		"name": "Jonatas Elieser Moreira",
		"phone": "18999999999",
		"email": "jonatas.em25@gmail.com",
		"role": "client"
	},
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9uYXRhcyBFbGllc2VyIE1vcmVpcmEiLCJwaG9uZSI6IjE4OTk5OTk5OTk5Iiwicm9sZSI6ImNsaWVudCIsImlhdCI6MTc4ODg4MjE1MSwiZXhwIjoxNzg4ODg5MzUxLCJzdWIiOiI2YWEwMmNlMmE4NzkzZWFmZWUyYTU0ZTYifQ.2XwhEN_M8TuJxde7VNxy-eymeh7ywXTpCBIt2wUUrn8"
}
```