package br.com.musicmaker

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import androidx.activity.OnBackPressedCallback // Importante para o botão voltar
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import br.com.musicmaker.databinding.FragmentWebBinding

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

        // --- CORREÇÃO: BOTÃO VOLTAR DO CELULAR ---
        // Faz o botão voltar navegar no histórico do WebView antes de fechar o app
        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    requireActivity().onBackPressed()
                }
            }
        })

        return binding.root
    }

    private fun configurarWebView() {
        binding.webView.apply {
            // Habilita o JavaScript
            settings.javaScriptEnabled = true

            // Habilita o DOM Storage (para localStorage, se precisar)
            settings.domStorageEnabled = true

            // --- CORREÇÃO CRÍTICA AQUI ---
            // LOAD_NO_CACHE força o Android a carregar a versão mais nova dos HTMLs
            settings.cacheMode = WebSettings.LOAD_NO_CACHE

            // Esta é a "Ponte" que conecta JS e Kotlin
            addJavascriptInterface(WebAppInterface(requireContext()), "Android")
        }
    }

    private fun carregarPaginaInicial() {
        // Carrega o index.html para que o usuário veja os botões de perfil.
        // A lógica de "pular o login" está no index.html.
        Log.d("WebFragment", "Modo de apresentação: Carregando index.html")
        binding.webView.loadUrl("file:///android_asset/index.html")
    }

    // --- CLASSE DA "PONTE" (JavaScript -> Kotlin) ---
    private inner class WebAppInterface(private val context: Context) {

        @JavascriptInterface
        fun irParaTelaDeLogin() {
            activity?.runOnUiThread {
                Log.d("WebAppInterface", "BYPASS: irParaTelaDeLogin() foi chamado!")

                // Pega o 'tipoPerfil' que o index.html salvou
                binding.webView.evaluateJavascript("localStorage.getItem('tipoPerfil')") { tipo ->
                    // Remove as aspas que o evaluateJavascript retorna (ex: "banda" -> banda)
                    val perfilLimpo = tipo?.replace("\"", "")

                    if (perfilLimpo == "banda") {
                        Log.d("WebAppInterface", "Perfil é 'banda', carregando banda.html")

                        // --- CORREÇÃO: Usar banda.html em vez de agenda.html ---
                        binding.webView.loadUrl("file:///android_asset/banda.html")

                    } else if (perfilLimpo == "musico") {
                        Log.d("WebAppInterface", "Perfil é 'musico', carregando perfil-musico.html")
                        binding.webView.loadUrl("file:///android_asset/perfil-musico.html")

                    } else {
                        Log.w("WebAppInterface", "Perfil desconhecido ($tipo), voltando ao dashboard.")
                        binding.webView.loadUrl("file:///android_asset/dashboard.html")
                    }
                }
            }
        }

        @JavascriptInterface
        fun getAuthToken(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o token")
            val tokenReal = sharedPref.getString(TOKEN_KEY, null)
            return tokenReal ?: "FAKE_TOKEN_PARA_APRESENTAÇÃO"
        }

        @JavascriptInterface
        fun getNomeUsuario(): String? {
            Log.d("WebAppInterface", "JavaScript pediu o nome do usuário")
            val nomeSalvo = sharedPref.getString(NOME_KEY, null)
            return nomeSalvo ?: "Jean Teste" // Coloquei seu nome aqui para ficar legal na demo
        }

        @JavascriptInterface
        fun fazerLogout() {
            Log.d("WebAppInterface", "JavaScript pediu logout")

            sharedPref.edit()
                .remove(TOKEN_KEY)
                .remove(NOME_KEY)
                .apply()

            activity?.runOnUiThread {
                Log.d("WebAppInterface", "Token removido, recarregando o app.")
                binding.webView.loadUrl("file:///android_asset/index.html")
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}