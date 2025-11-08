package br.com.musicmaker

/**
 * Este arquivo define as classes de dados (Data Classes) para
 * a comunicação com a API de autenticação.
 */

// Esta classe representa o JSON que o APP envia para o backend
// (Corresponde ao @RequestBody Usuario loginRequest no seu AuthController)
data class LoginRequest(
    val email: String,
    val senha: String
)

// Esta classe representa o JSON que o BACKEND devolve para o app
// (Corresponde à resposta de sucesso do seu /api/auth/login)
data class LoginResponse(
    val token: String,
    val usuario: UsuarioInfo
)

// Esta classe é parte da LoginResponse
data class UsuarioInfo(
    val nome: String,
    val email: String
)