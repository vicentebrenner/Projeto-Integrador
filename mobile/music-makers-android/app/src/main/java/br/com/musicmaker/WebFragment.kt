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
    // Flag temporária para pular o fluxo de login e ir direto ao dashboard.
    // Ajuste para `false` quando a autenticação real for restabelecida.
    private val SKIP_AUTH = true

    // --- CORREÇÃO APLICADA AQUI ---
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

    private fun carregarPaginaInicial() {
        if (SKIP_AUTH) {
            Log.d("WebFragment", "Skip auth ativado, carregando dashboard diretamente.")
            binding.webView.loadUrl("file:///android_asset/dashboard.html")
            return
        }

        // 1. O "Cérebro": Verifica se o token existe
        val token = sharedPref.getString(TOKEN_KEY, null)

        if (token.isNullOrEmpty()) {
            // Se NÃO tem token, carrega o index.html (tela de escolha)
            Log.d("WebFragment", "Nenhum token encontrado, carregando index.html")
            binding.webView.loadUrl("file:///android_asset/index.html")
        } else {
            // Se TEM token, vai direto para o dashboard
            Log.d("WebFragment", "Token encontrado, carregando dashboard.html")
            binding.webView.loadUrl("file:///android_asset/dashboard.html")
        }
    }

    // --- CLASSE DA "PONTE" (JavaScript -> Kotlin) ---
    // Esta classe interna contém os métodos que o JavaScript pode chamar
    private inner class WebAppInterface(private val context: Context) {

        /**
         * O JavaScript (do index.html) vai chamar esta função
         * quando o usuário clicar em "Gestor".
         */
        @JavascriptInterface
        fun irParaTelaDeLogin() {
            // Esta função roda na thread principal do App
            activity?.runOnUiThread {
                // Navega para o LoginFragment nativo
                Log.d("WebAppInterface", "Navegando para o LoginFragment...")

                // --- CORREÇÃO APLICADA AQUI (LINHA DESCOMENTADA) ---
                findNavController().navigate(R.id.action_webFragment_to_loginFragment)
            }
        }

        /**
         * O JavaScript (do dashboard.js) vai chamar esta função
         * para pegar o token de autenticação.
         */
        @JavascriptInterface
        fun getAuthToken(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o token")
            return sharedPref.getString(TOKEN_KEY, null)
        }

        /**
         * O JavaScript (do dashboard.js) vai chamar esta função
         * para pegar o nome do usuário.
         */
        @JavascriptInterface
        fun getNomeUsuario(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o nome do usuário")
            return sharedPref.getString(NOME_KEY, null)
        }

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
            // Como o token foi removido, a lógica do 'carregarPaginaInicial()'
            // vai carregar o 'index.html' automaticamente.
            activity?.runOnUiThread {
                Log.d("WebAppInterface", "Token removido, recarregando o app.")
                // Carrega o index.html (que é a nossa página de "logout")
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