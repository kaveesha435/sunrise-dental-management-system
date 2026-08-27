package com.sunrisedental.service;

import com.sunrisedental.dto.DentistRequest;
import com.sunrisedental.dto.DentistResponse;
import com.sunrisedental.entity.AvailabilityStatus;
import com.sunrisedental.entity.Dentist;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.AppointmentRepository;
import com.sunrisedental.repository.DentistRepository;
import com.sunrisedental.service.impl.DentistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DentistServiceTests {

    @Mock
    private DentistRepository dentistRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private DentistServiceImpl dentistService;

    private Dentist dentist;
    private DentistRequest dentistRequest;

    @BeforeEach
    void setUp() {
        dentist = Dentist.builder()
                .id(1L)
                .name("Dr. Smith")
                .specialization("General")
                .contact("1234567890")
                .email("smith@example.com")
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .active(true)
                .build();

        dentistRequest = new DentistRequest();
        dentistRequest.setName("Dr. Smith");
        dentistRequest.setSpecialization("General");
        dentistRequest.setContact("1234567890");
        dentistRequest.setEmail("smith@example.com");
        dentistRequest.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        dentistRequest.setActive(true);
    }

    @Test
    void testCreateDentist_Success() {
        when(dentistRepository.save(any(Dentist.class))).thenReturn(dentist);
        when(appointmentRepository.countByDentistIdAndAppointmentDateAndStatusNot(anyLong(), any(), any())).thenReturn(0L);

        DentistResponse response = dentistService.create(dentistRequest);

        assertNotNull(response);
        assertEquals("Dr. Smith", response.getName());
        verify(dentistRepository, times(1)).save(any(Dentist.class));
    }

    @Test
    void testGetDentistById_Success() {
        when(dentistRepository.findById(1L)).thenReturn(Optional.of(dentist));
        when(appointmentRepository.countByDentistIdAndAppointmentDateAndStatusNot(eq(1L), any(), any())).thenReturn(5L);

        DentistResponse response = dentistService.getById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Dr. Smith", response.getName());
        assertEquals(5L, response.getTodayAppointmentCount());
        verify(dentistRepository, times(1)).findById(1L);
    }

    @Test
    void testGetDentistById_NotFound() {
        when(dentistRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> dentistService.getById(99L));
        verify(dentistRepository, times(1)).findById(99L);
    }

    @Test
    void testUpdateDentist_Success() {
        when(dentistRepository.findById(1L)).thenReturn(Optional.of(dentist));
        when(dentistRepository.save(any(Dentist.class))).thenReturn(dentist);
        when(appointmentRepository.countByDentistIdAndAppointmentDateAndStatusNot(anyLong(), any(), any())).thenReturn(0L);

        dentistRequest.setName("Dr. John Smith");
        DentistResponse response = dentistService.update(1L, dentistRequest);

        assertNotNull(response);
        verify(dentistRepository, times(1)).findById(1L);
        verify(dentistRepository, times(1)).save(any(Dentist.class));
    }

    @Test
    void testDeleteDentist_Success() {
        when(dentistRepository.findById(1L)).thenReturn(Optional.of(dentist));
        when(appointmentRepository.existsByDentistId(1L)).thenReturn(false);
        doNothing().when(dentistRepository).delete(dentist);

        assertDoesNotThrow(() -> dentistService.delete(1L));

        verify(dentistRepository, times(1)).findById(1L);
        verify(appointmentRepository, times(1)).existsByDentistId(1L);
        verify(dentistRepository, times(1)).delete(dentist);
    }

    @Test
    void testDeleteDentist_FailsWhenAppointmentsExist() {
        when(dentistRepository.findById(1L)).thenReturn(Optional.of(dentist));
        when(appointmentRepository.existsByDentistId(1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> dentistService.delete(1L));

        verify(dentistRepository, times(1)).findById(1L);
        verify(appointmentRepository, times(1)).existsByDentistId(1L);
        verify(dentistRepository, never()).delete(any());
    }
}
