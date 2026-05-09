package com.unibuc.bundle_forge.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "game_key")
public class GameKey {

    @Id
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    public enum Status { ACTIVE, USED }
}
