package com.musicMakers.Projeto;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@SpringBootApplication
public class ProjetoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjetoApplication.class, args);
    }

    @Bean
    public CommandLineRunner createAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se o usuário admin já existe para não criar duplicado
            if (usuarioRepository.findByEmail("admin@admin.com").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setEmail("admin@admin.com");
                admin.setSenha(passwordEncoder.encode("admin"));
                admin.setTipoUsuario("ADMIN");
                admin.setEnabled(true);
                admin.setDataCriacao(LocalDate.now());
                
                usuarioRepository.save(admin);
                System.out.println("---------------------------------------------");
                System.out.println("USUÁRIO ADMIN CRIADO COM SUCESSO!");
                System.out.println("Email: admin@gmail.com");
                System.out.println("Senha: teste1@");
                System.out.println("---------------------------------------------");
            }
        };
    }
}