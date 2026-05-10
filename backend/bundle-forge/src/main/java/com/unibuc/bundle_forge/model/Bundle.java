package com.unibuc.bundle_forge.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "bundle")
public class Bundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String cover;

    @Column(nullable = false, length = 1000)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String longDescription;

    @Column(nullable = false)
    private Integer platformMinPct;

    @Column(nullable = false)
    private Integer devMinPct;

    @ManyToMany
    @JoinTable(
        name = "bundle_games",
        joinColumns = @JoinColumn(name = "bundle_id"),
        inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    @Builder.Default
    private List<Game> games = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "bundle_tiers", joinColumns = @JoinColumn(name = "bundle_id"))
    @OrderBy("numRequiredGames ASC")
    @Builder.Default
    private List<BundleTier> tiers = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer salesCount = 0;

    @ManyToOne
    @JoinColumn(name = "charity_founder_id")
    private CharityFounder charityFounder;
}
