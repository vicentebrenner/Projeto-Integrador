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

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

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
                    val token = response.body()!!.token
                    val nomeUsuario = response.body()!!.usuario.nome

                    salvarToken(token)
                    Toast.makeText(requireContext(), "Bem-vindo, $nomeUsuario!", Toast.LENGTH_LONG).show()

                    // Navega para a Home (use o ID da "seta" que você criou no Dia 6)
                    // Verifique o ID em 'mobile_navigation.xml' se der erro aqui
                   // findNavController().navigate(R.id.action_loginFragment_to_nav_home)

                } else {
                    // FALHA (Ex: senha errada)
                    Toast.makeText(requireContext(), "E-mail ou senha inválidos", Toast.LENGTH_LONG).show()
                    // --- FIM DA LÓGICA DE CARREGAMENTO (EM CASO DE FALHA) ---
                    binding.loginButton.isEnabled = true // Reabilita o botão
                    binding.loginProgressbar.visibility = View.GONE // Esconde o ProgressBar
                }

            } catch (e: Exception) {
                // ERRO DE REDE (Ex: backend desligado)
                Log.e("LoginFragment", "Erro de conexão", e)
                Toast.makeText(requireContext(), "Erro de conexão. Verifique o backend.", Toast.LENGTH_LONG).show()
                // --- FIM DA LÓGICA DE CARREGAMENTO (EM CASO DE ERRO) ---
                binding.loginButton.isEnabled = true // Reabilita o botão
                binding.loginProgressbar.visibility = View.GONE // Esconde o ProgressBar
            }
        }
    }

    // Função para salvar o token
    private fun salvarToken(token: String) {
        val sharedPref = activity?.getSharedPreferences("MUSIC_MAKERS_PREFS", Context.MODE_PRIVATE) ?: return
        with (sharedPref.edit()) {
            putString("JWT_TOKEN", token)
            apply()
        }
    }

    // Limpa o binding para evitar vazamento de memória
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}