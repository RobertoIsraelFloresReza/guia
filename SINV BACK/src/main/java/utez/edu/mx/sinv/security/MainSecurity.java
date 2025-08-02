package utez.edu.mx.sinv.security;

import utez.edu.mx.sinv.security.jwt.JwtAuthenticationFilter;
import utez.edu.mx.sinv.security.jwt.JwtProvider;
import utez.edu.mx.sinv.security.service.UserDetailsImplService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class MainSecurity {
    // Constantes para los roles
    private static final String ADMINISTRADOR = "ADMINISTRADOR";
    private static final String TRABAJADOR = "TRABAJADOR";
    private static final String[] ALL_ROLES = {ADMINISTRADOR, TRABAJADOR};

    private final UserDetailsImplService service;
    private final JwtProvider jwtProvider;

    public MainSecurity(UserDetailsImplService service, JwtProvider jwtProvider) {
        this.service = service;
        this.jwtProvider = jwtProvider;
    }

    private final String[] whiteList = {
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider dao = new DaoAuthenticationProvider();
        dao.setUserDetailsService(service);
        dao.setPasswordEncoder(passwordEncoder());
        return dao;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter filter() {
        return new JwtAuthenticationFilter(jwtProvider, service);
    }

    // Bean para configurar CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Origen del frontend
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()) // Usará el corsConfigurationSource bean automáticamente
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req ->
                        req.requestMatchers(whiteList).permitAll()
                                .requestMatchers("/api/users/request-password-reset").permitAll()
                                .requestMatchers("/api/users/reset-password").permitAll()
                                .requestMatchers("/api/users/").permitAll()
                                .requestMatchers("/api/articles/**").hasAnyAuthority(ALL_ROLES)
                                .requestMatchers("/api/categories/**").hasAnyAuthority(ALL_ROLES)
                                .requestMatchers("/api/storage/**").hasAnyAuthority(ALL_ROLES)
                                .requestMatchers("/api/profile/**").hasAnyAuthority(ALL_ROLES)
                                .requestMatchers("/api/users/**").hasAnyAuthority(ALL_ROLES)
                                .requestMatchers("/api/role/**").hasAnyAuthority(ALL_ROLES)
                                .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .headers(header -> header.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(filter(), UsernamePasswordAuthenticationFilter.class)
                .logout(out -> out.logoutUrl("/api/auth/logout").clearAuthentication(true));
        return http.build();
    }
}