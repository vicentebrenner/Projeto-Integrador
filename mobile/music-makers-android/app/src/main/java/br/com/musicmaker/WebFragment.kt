package br.com.musicmaker

// --- GARANTA QUE TODAS ESTAS IMPORTAÇÕES ESTÃO AQUI ---
import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import br.com.musicmaker.databinding.FragmentWebBinding
// --- FIM DAS IMPORTAÇÕES ---

class WebFragment : Fragment() {

    private var _binding: FragmentWebBinding? = null
    private val binding get() = _binding!!

    // Nome do SharedPreferences (DEVE ser o mesmo do LoginFragment)
    private val PREFS_NAME = "MUSIC_MAKERS_PREFS"
    private val TOKEN_KEY = "JWT_TOKEN"
    private val NOME_KEY = "NOME_USUARIO"

    private lateinit var sharedPref: SharedPreferences

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWebBinding.inflate(inflater, container, false)
        sharedPref = requireContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        configurarWebView()
        carregarPaginaInicial()

        return binding.root
    }

    private fun configurarWebView() {
        binding.webView.apply {
            // Habilita o JavaScript
            settings.javaScriptEnabled = true

            // Habilita o DOM Storage (para localStorage, se precisar)
            settings.domStorageEnabled = true

            // Habilita o cache para melhor performance
            settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK

            // Esta é a "Ponte" que conecta JS e Kotlin
            // O JavaScript vai chamar os métodos usando o nome "Android"
            addJavascriptInterface(WebAppInterface(requireContext()), "Android")
        }
    }

    // --- MUDANÇA 1 (PARA APRESENTAÇÃO) ---
    private fun carregarPaginaInicial() {
        // Carrega o index.html para que o usuário veja os botões de perfil.
        // A lógica de "pular o login" está no index.html.
        Log.d("WebFragment", "Modo de apresentação: Carregando index.html")
        binding.webView.loadUrl("file:///android_asset/index.html")
    }
    // --- FIM DA MUDANÇA 1 ---

    // --- CLASSE DA "PONTE" (JavaScript -> Kotlin) ---
    // Esta classe interna contém os métodos que o JavaScript pode chamar
    private inner class WebAppInterface(private val context: Context) {

        /**
         * O JavaScript (do dashboard.html) VAI chamar esta função.
         * Vamos interceptá-la!
         */
        // --- MUDANÇA 4 (A MAIS IMPORTANTE) ---
        @JavascriptInterface
        fun irParaTelaDeLogin() {
            // Esta função roda na thread principal do App
            activity?.runOnUiThread {
                // EM VEZ DE IR PARA O LOGIN NATIVO, vamos ler o localStorage
                // que o index.html salvou e carregar a página WEB correta.
                Log.d("WebAppInterface", "BYPASS: irParaTelaDeLogin() foi chamado!")

                // Pega o 'tipoPerfil' que o index.html salvou
                binding.webView.evaluateJavascript("localStorage.getItem('tipoPerfil')") { tipo ->
                    // tipo pode ser "banda", "musico", "null" (string), ou null (objeto)

                    // 1. Remove as aspas, se existirem (e checa se é nulo)
                    val perfilLimpo = tipo?.replace("\"", "")

                    if (perfilLimpo == "banda") {
                        Log.d("WebAppInterface", "Perfil é 'banda', carregando agenda.html")

                        // ***** ATENÇÃO: TROQUE "agenda.html" PELO NOME CORRETO *****
                        // (Ex: "gestao.html", "dashboard_banda.html", etc.)
                        binding.webView.loadUrl("file:///android_asset/agenda.html")

                    } else if (perfilLimpo == "musico") {
                        Log.d("WebAppInterface", "Perfil é 'musico', carregando perfil-musico.html")

                        // ***** CORREÇÃO APLICADA AQUI *****
                        // Agora está usando "perfil-musico.html" com hífen
                        binding.webView.loadUrl("file:///android_asset/perfil-musico.html")

                    } else {
                        // Fallback: Se algo der errado (tipo é null, "null", ou outro valor)
                        Log.w("WebAppInterface", "Perfil não encontrado no localStorage (valor recebido: $tipo), voltando ao dashboard.")
                        binding.webView.loadUrl("file:///android_asset/dashboard.html")
                    }
                }

                // Lógica original (REMOVIDA PARA APRESENTAÇÃO):
                // Log.d("WebAppInterface", "Navegando para o LoginFragment...")
                // findNavController().navigate(R.id.action_webFragment_to_loginFragment)
            }
        }
        // --- FIM DA MUDANÇA 4 ---

        /**
         * O JavaScript (do dashboard.js) vai chamar esta função
         * para pegar o token de autenticação.
         */
        // --- MUDANÇA 2 (PARA APRESENTAÇÃO) ---
        @JavascriptInterface
        fun getAuthToken(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o token")

            // Retorna um "token falso" para que o dashboard.html
            // pense que o usuário está logado.
            val tokenReal = sharedPref.getString(TOKEN_KEY, null)
            return tokenReal ?: "FAKE_TOKEN_PARA_APRESENTAÇÃO"
        }
        // --- FIM DA MUDANÇA 2 ---

        /**
         * O JavaScript (do dashboard.js) vai chamar esta função
         * para pegar o nome do usuário.
         */
        // --- MUDANÇA 3 (PARA APRESENTAÇÃO) ---
        @JavascriptInterface
        fun getNomeUsuario(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o nome do usuário")
            // Retorna um nome de teste para a apresentação
            val nomeSalvo = sharedPref.getString(NOME_KEY, null)
            return nomeSalvo ?: "Usuário Teste"
        }
        // --- FIM DA MUDANÇA 3 ---

        /**
         * O JavaScript (do global.js) vai chamar esta função
         * quando o usuário clicar em "Sair".
         */
        @JavascriptInterface
        fun fazerLogout() {
            Log.d("WebAppInterface", "JavaScript pediu logout")

            // 1. Limpa o token e o nome nativamente
            sharedPref.edit()
                .remove(TOKEN_KEY)
                .remove(NOME_KEY)
                .apply()

            // 2. Recarrega a página (na thread principal)
            activity?.runOnUiThread {
                Log.d("WebAppInterface", "Token removido, recarregando o app.")
                // Volta para o index.html
                binding.webView.loadUrl("file:///android_asset/index.html")
            }
        }
    }
    // --- FIM DA PONTE ---

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}