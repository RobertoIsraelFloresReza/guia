package utez.edu.mx.sinv.controllers.view;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/view")
@Tag(name = "Controlador de Vistas", description = "Controlador para gestionar vistas de la aplicación")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})

public class ViewController {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping("/")
    @Tag(name = "Vista Principal", description = "Muestra la vista principal de la aplicación")
    public String showView(Model model) {
        String folder = activeProfile != null ? activeProfile : "default";
        return folder + "/index"; // Retorna la vista correspondiente
    }
}