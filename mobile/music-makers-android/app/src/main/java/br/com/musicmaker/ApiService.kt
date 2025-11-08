package br.com.musicmaker

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Esta interface define todos os endpoints da API que o app vai consumir.
 * O Retrofit usa esta interface para gerar o código de rede.
 */
interface ApiService {

    /**
     * Define a chamada para o endpoint de login.
     * Corresponde ao @PostMapping("/api/auth/login") no seu AuthController.java
     *
     * @param request O objeto LoginRequest (com email e senha) que será enviado no corpo (Body) da requisição.
     * @return Uma Resposta (Response) que, em caso de sucesso, conterá um objeto LoginResponse.
     */
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // (No futuro, você adicionaria outras chamadas aqui, como @GET("/api/usuarios"))
}