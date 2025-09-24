package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class TokenService {

    // A chave secreta será injetada a partir do application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    // Tempo de expiração do token em milissegundos (aqui definido para 24 horas)
    private final long expirationTime = 86400000; // 24 * 60 * 60 * 1000

    /**
     * Gera a chave de assinatura usada pelo JWT a partir da chave secreta.
     * @return A chave de assinatura.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * Gera um novo token JWT para um usuário específico.
     * @param usuario O usuário para o qual o token será gerado.
     * @return Uma string que representa o token JWT.
     */
    public String generateToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail()) // Define o "dono" do token (geralmente o email ou id)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Data de criação do token
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Data de expiração do token
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Assina o token com a chave e o algoritmo
                .compact(); // Constrói a string final do token
    }

    /**
     * Extrai todas as informações (claims) de um token.
     * @param token O token JWT.
     * @return As claims contidas no token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Função genérica para extrair uma informação específica (claim) do token.
     * @param token O token JWT.
     * @param claimsResolver A função que extrai a claim desejada.
     * @return A claim específica.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrai o nome de usuário (neste caso, o email) de dentro do token.
     * @param token O token JWT.
     * @return O email do usuário.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai a data de expiração do token.
     * @param token O token JWT.
     * @return A data de expiração.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Verifica se o token já expirou.
     * @param token O token JWT.
     * @return true se o token estiver expirado, false caso contrário.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Valida o token, verificando se o email corresponde ao do usuário e se o token não está expirado.
     * @param token O token JWT.
     * @param userEmail O email do usuário para comparação.
     * @return true se o token for válido, false caso contrário.
     */
    public Boolean validateToken(String token, String userEmail) {
        final String username = extractUsername(token);
        return (username.equals(userEmail) && !isTokenExpired(token));
    }
}


