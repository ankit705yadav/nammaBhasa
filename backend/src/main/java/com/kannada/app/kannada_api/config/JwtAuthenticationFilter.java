package com.kannada.app.kannada_api.config;

import com.kannada.app.kannada_api.user.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Extend OncePerRequestFilter to ensure this filter runs only once per request
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Inject your services for validating the token and getting user details
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 1. Check if the Authorization header is present and correctly formatted
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // If not, pass the request to the next filter
            return;
        }

        // 2. Extract the token from the header
        jwt = authHeader.substring(7);

        try {
            // 3. Extract the username from the token
            username = jwtService.extractUsername(jwt);
        } catch (IllegalArgumentException | ExpiredJwtException | MalformedJwtException e) {
            // If the token is invalid or expired, send an unauthorized error
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token");
            return;
        }

        // 4. If we have a username and the user is not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Validate the token against the user details
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // If the token is valid, create an authentication object
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set the authentication object in the SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Pass the request along the filter chain
        filterChain.doFilter(request, response);
    }
}
