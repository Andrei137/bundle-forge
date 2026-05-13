package com.unibuc.bundle_forge.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coupon")
public class Coupon {

    public enum Type { PERCENTAGE, FIXED_AMOUNT }
    public enum Status { ACTIVE, USED, EXPIRED }

    @Id
    @Column(name = "code", length = 14)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Type type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column
    private LocalDate expirationDate;
}
