# User Restified

## Route prefixes
   ```/api/v1```

## Endpoints:

### GET /user/:username

this endpoing will fetch the details for requested user

#### Response

```json
{
  "firstname": "Bruce",
  "lastname": "Wayne",
  "email": "batman@wayneenterprice.com"
}
```

`Status: 200 OK`


### PUT /user/:username

update the user profile

#### Response
```json
{
    "message": "Updated Successfully"
}
```
`Status: 200`

### POST /register

Registers a User.

#### Response

```json
 {
     "message":  "success"
 }
```

`Status: 201 Created`

### POST /login

After user login it will return json webtoken which will be used for rest of user api's

#### Response

```json
 {
    "tokenId": "jsonwebtoken"
 }
```

`Status: 200`
