package br.com.musicmaker

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import br.com.musicmaker.databinding.FragmentLoginBinding
import kotlinx.coroutines.launch
import java.lang.Exception
// Adicione esta importação manualmente se estiver faltando
import br.com.musicmaker.R

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    // Define os nomes das chaves como constantes
    private val PREFS_NAME = "MUSIC_MAKERS_PREFS"
    private val TOKEN_KEY = "JWT_TOKEN"
    private val NOME_KEY = "NOME_USUARIO"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.loginButton.setOnClickListener {
            realizarLogin()
        }
    }

    private fun realizarLogin() {
        val email = binding.emailEdittext.text.toString()
        val senha = binding.passwordEdittext.text.toString()

        if (email.isBlank() || senha.isBlank()) {
            Toast.makeText(requireContext(), "Por favor, preencha e-mail e senha", Toast.LENGTH_SHORT).show()
            return
        }

        val request = LoginRequest(email, senha)

        // --- INÍCIO DA LÓGICA DE CARREGAMENTO ---
        binding.loginButton.isEnabled = false // Desabilita o botão
        binding.loginProgressbar.visibility = View.VISIBLE // Mostra o ProgressBar

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                // Tenta fazer o login
                val response = RetrofitClient.instance.login(request)

                if (response.isSuccessful && response.body() != null) {
                    // SUCESSO!
                    val loginResponse = response.body()!! // Pega a resposta
                    val token = loginResponse.token
                    val nomeUsuario = loginResponse.usuario.nome

                    // <-- MUDANÇA 1: Salva o token E o nome
                    salvarToken(token, nomeUsuario)

                    Toast.makeText(requireContext(), "Bem-vindo, $nomeUsuario!", Toast.LENGTH_LONG).show()

                    // Esconde o loading antes de navegar
                    binding.loginButton.isEnabled = true
                    binding.loginProgressbar.visibility = View.GONE

                    // --- MUDANÇA TEMPORÁRIA ---
                    // A linha de navegação está comentada para quebrar o loop
                    // findNavController().navigate(R.id.action_loginFragment_to_webFragment)



                } else {
                    // FALHA (Ex: senha errada)
                    Toast.makeText(requireContext(), "E-mail ou senha inválidos", Toast.LENGTH_LONG).show()
                    binding.loginButton.isEnabled = true // Reabilita o botão
                    binding.loginProgressbar.visibility = View.GONE // Esconde o ProgressBar
                }

            } catch (e: Exception) {
                // ERRO DE REDE (Ex: backend desligado)
                Log.e("LoginFragment", "Erro de conexão", e)
                Toast.makeText(requireContext(), "Erro de conexão. Verifique o backend.", Toast.LENGTH_LONG).show()
                binding.loginButton.isEnabled = true // Reabilita o botão
                binding.loginProgressbar.visibility = View.GONE // Esconde o ProgressBar
            }
        }
    }

    // <-- MUDANÇA 3: Função para salvar o token E o nome
    private fun salvarToken(token: String, nomeUsuario: String) {
        val sharedPref = activity?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) ?: return
        with (sharedPref.edit()) {
            putString(TOKEN_KEY, token)
            putString(NOME_KEY, nomeUsuario) // Salva o nome também
            apply()
        }
    }

    // Limpa o binding para evitar vazamento de memória
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}