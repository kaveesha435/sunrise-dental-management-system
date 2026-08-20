package com.sunrisedental;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Spring context load test.
 * Verifies that the application context starts without errors.
 *
 * Note: Uses H2 in-memory database for testing to avoid requiring
 * a live PostgreSQL instance in CI/CD.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.open-in-view=false"
})
class SunriseDentalApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts successfully.
    }
}
