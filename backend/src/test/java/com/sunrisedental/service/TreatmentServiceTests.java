package com.sunrisedental.service;

import com.sunrisedental.dto.TreatmentRequest;
import com.sunrisedental.dto.TreatmentResponse;
import com.sunrisedental.entity.Treatment;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.TreatmentRepository;
import com.sunrisedental.service.impl.TreatmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TreatmentServiceTests {

    @Mock
    private TreatmentRepository treatmentRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private TreatmentServiceImpl treatmentService;

    private Treatment treatment;
    private TreatmentRequest treatmentRequest;

    @BeforeEach
    void setUp() {
        treatment = Treatment.builder()
                .id(1L)
                .name("Root Canal")
                .description("Root canal treatment")
                .standardCost(new BigDecimal("15000.00"))
                .active(true)
                .build();

        treatmentRequest = new TreatmentRequest();
        treatmentRequest.setName("Root Canal");
        treatmentRequest.setDescription("Root canal treatment");
        treatmentRequest.setStandardCost(new BigDecimal("15000.00"));
        treatmentRequest.setActive(true);
    }

    @Test
    void testCreateTreatment_Success() {
        when(treatmentRepository.save(any(Treatment.class))).thenReturn(treatment);

        TreatmentResponse response = treatmentService.create(treatmentRequest);

        assertNotNull(response);
        assertEquals("Root Canal", response.getName());
        assertEquals(new BigDecimal("15000.00"), response.getStandardCost());
        verify(treatmentRepository, times(1)).save(any(Treatment.class));
    }

    @Test
    void testCreateTreatment_NegativeCost() {
        treatmentRequest.setStandardCost(new BigDecimal("-500.00"));

        assertThrows(IllegalArgumentException.class, () -> treatmentService.create(treatmentRequest));
        verify(treatmentRepository, never()).save(any());
    }

    @Test
    void testGetTreatmentById_Success() {
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(treatment));

        TreatmentResponse response = treatmentService.getById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Root Canal", response.getName());
        verify(treatmentRepository, times(1)).findById(1L);
    }

    @Test
    void testGetTreatmentById_NotFound() {
        when(treatmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> treatmentService.getById(99L));
        verify(treatmentRepository, times(1)).findById(99L);
    }

    @Test
    void testUpdateTreatment_Success() {
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(treatment));
        when(treatmentRepository.save(any(Treatment.class))).thenReturn(treatment);

        treatmentRequest.setName("Advanced Root Canal");
        TreatmentResponse response = treatmentService.update(1L, treatmentRequest);

        assertNotNull(response);
        verify(treatmentRepository, times(1)).findById(1L);
        verify(treatmentRepository, times(1)).save(any(Treatment.class));
    }

    @Test
    void testDeleteTreatment_Success() {
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(treatment));
        when(appointmentRepository.existsByTreatmentId(1L)).thenReturn(false);
        doNothing().when(treatmentRepository).delete(treatment);

        assertDoesNotThrow(() -> treatmentService.delete(1L));

        verify(treatmentRepository, times(1)).findById(1L);
        verify(appointmentRepository, times(1)).existsByTreatmentId(1L);
        verify(treatmentRepository, times(1)).delete(treatment);
    }

    @Test
    void testDeleteTreatment_FailsWhenAppointmentsExist() {
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(treatment));
        when(appointmentRepository.existsByTreatmentId(1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> treatmentService.delete(1L));

        verify(treatmentRepository, times(1)).findById(1L);
        verify(appointmentRepository, times(1)).existsByTreatmentId(1L);
        verify(treatmentRepository, never()).delete(any());
    }
}
