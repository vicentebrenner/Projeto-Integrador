package br.com.musicmaker

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Este é um objeto "Singleton" que gerencia a instância principal do Retrofit.
 * Ele garante que o app use uma única configuração de rede.
 */
object RetrofitClient {

    // IMPORTANTE: Este é o IP "mágico" que o emulador Android usa
    // para acessar o "localhost" (127.0.0.1) do seu computador.
    private const val BASE_URL = "http://18.229.124.123:8080/"

    /**
     * Esta é a instância "preguiçosa" (lazy) do Retrofit.
     * Ela só será criada na primeira vez que for usada.
     */
    val instance: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL) // Define a URL base da sua API
            .addConverterFactory(GsonConverterFactory.create()) // Adiciona o conversor GSON (JSON)
            .build()

        // Cria e retorna a implementação da nossa ApiService
        retrofit.create(ApiService::class.java)
    }
}