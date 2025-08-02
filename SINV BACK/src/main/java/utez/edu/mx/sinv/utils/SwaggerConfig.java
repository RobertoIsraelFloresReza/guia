package utez.edu.mx.sinv.utils;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI config() {
        return new OpenAPI().info(new Info()
                .title("API para almacenes")
                .description("Documentación de los endpoints de la API para los almacenes")
                .version("V1.0")
        );
    }
}