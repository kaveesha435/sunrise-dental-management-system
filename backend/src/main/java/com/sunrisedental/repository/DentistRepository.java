package com.sunrisedental.repository;

import com.sunrisedental.entity.AvailabilityStatus;
import com.sunrisedental.entity.Dentist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for Dentist entity.
 */
public interface DentistRepository extends JpaRepository<Dentist, Long> {

    List<Dentist> findByActiveTrue();

    @Query("""
            SELECT d FROM Dentist d
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.email) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR d.contact LIKE CONCAT('%', :search, '%')
                  )
              AND (:specialization IS NULL OR :specialization = '' OR LOWER(d.specialization) = LOWER(:specialization))
              AND (:availabilityStatus IS NULL OR d.availabilityStatus = :availabilityStatus)
              AND (:active IS NULL OR d.active = :active)
            """)
    Page<Dentist> findFilteredAndSearched(
            @Param("search") String search,
            @Param("specialization") String specialization,
            @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
            @Param("active") Boolean active,
            Pageable pageable);

    long countByActiveTrue();

    long countByAvailabilityStatusAndActiveTrue(AvailabilityStatus availabilityStatus);

    @Query("SELECT DISTINCT d.specialization FROM Dentist d WHERE d.active = true")
    List<String> findActiveSpecializations();
}
