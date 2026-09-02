package com.sunrisedental.repository;

import com.sunrisedental.entity.Treatment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for Treatment entity.
 */
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    List<Treatment> findByActiveTrue();

    @Query("""
            SELECT t FROM Treatment t
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (:active IS NULL OR t.active = :active)
            """)
    Page<Treatment> findFilteredAndSearched(
            @Param("search") String search,
            @Param("active") Boolean active,
            Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    long countByActiveTrue();

    long countByActiveFalse();
}
