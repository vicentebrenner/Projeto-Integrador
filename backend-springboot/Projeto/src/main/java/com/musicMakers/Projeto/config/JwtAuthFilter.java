package com.musicMakers.Projeto.config;

import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String userEmail;
        final String jwtToken;

        // 1. Verifica se o cabeçalho de autorização existe e começa com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Se não, continua para o próximo filtro
            return;
        }

        // 2. Extrai o token do cabeçalho (remove o "Bearer ")
        jwtToken = authHeader.substring(7);
        userEmail = tokenService.extractUsername(jwtToken); // Extrai o email do usuário de dentro do token

        // 3. Se o token contém um email e o usuário ainda não está autenticado...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 4. Busca o usuário no banco de dados
            UserDetails userDetails = this.usuarioRepository.findByEmail(userEmail)
                    .map(usuario -> new User(usuario.getEmail(), usuario.getSenha(), new ArrayList<>()))
                    .orElse(null);

            // 5. Valida o token
            if (userDetails != null && tokenService.validateToken(jwtToken, userDetails.getUsername())) {
                // 6. Se o token for válido, configura a autenticação no contexto do Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response); // Passa a requisição para o próximo filtro na cadeia
    }
}
