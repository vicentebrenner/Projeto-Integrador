package br.com.musicmaker.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast // Importamos o Toast para mensagens
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import br.com.musicmaker.R
import br.com.musicmaker.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    // --- ESTA É A CORREÇÃO ---
    // A função 'onViewCreated' original estava com os parâmetros errados.
    // A forma correta (com 'view' e 'savedInstanceState') é esta:
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 1. Clique do Botão GESTOR (leva para o Login)
        binding.buttonGestor.setOnClickListener {
            findNavController().navigate(R.id.action_nav_home_to_loginFragment)
        }

        // 2. Clique do Botão MÚSICO (mostra mensagem "em breve")
        binding.buttonMusico.setOnClickListener {
            // No futuro, isso levará para a tela de Perfil de Músico
            Toast.makeText(requireContext(), "Funcionalidade 'Perfil de Músico' em breve!", Toast.LENGTH_SHORT).show()
        }
    }
    // --- FIM DA CORREÇÃO ---

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}