package com.unibuc.bundle_forge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.convertor.SystemRequirementsConverter;
import com.unibuc.bundle_forge.dto.PlatformRequirements;
import com.unibuc.bundle_forge.utils.EnumUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder(toBuilder = true)
@Entity
@Table(name = "game")
public class Game implements EnumUtils.HasStatus<Game.Status> {

    public enum Status implements EnumUtils.TransitionAware<Status> {
        ANNOUNCED,
        PUBLISHED,
        DELISTED;

        @Override
        public boolean canTransitionFrom(Status from) {
            return switch (from) {
                case ANNOUNCED -> this == PUBLISHED || this == DELISTED;
                case PUBLISHED -> this == DELISTED;
                case DELISTED -> this == PUBLISHED;
            };
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(ViewUtils.Public.class)
    private Integer id;

    @Column(unique = true, nullable = false)
    @JsonView(ViewUtils.Public.class)
    private String title;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    private String shortDescription;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    private String longDescription;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    private List<String> languages;

    @JsonView(ViewUtils.Provider.class)
    private String link;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    private Double price;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private Integer discountPercentage = 0;

    @Column(nullable = false)
    @JsonView(ViewUtils.Public.class)
    @Builder.Default
    private LocalDate releaseDate = LocalDate.now();

    @Column(nullable = false)
    @Builder.Default
    private List<String> links = new ArrayList<>();

    @Convert(converter = SystemRequirementsConverter.class)
    @Column(columnDefinition = "json")
    @Builder.Default
    private Map<String, PlatformRequirements> systemRequirements = new HashMap<>();

    @Column(nullable = false)
    private String cover;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private List<String> youtubeIds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private Status status = Status.ANNOUNCED;

    @ManyToOne(optional = false)
    @JoinColumn(name = "developer_id", nullable = false)
    @JsonIgnore
    private Developer developer;

    @ManyToOne
    @JoinColumn(name = "publisher_id")
    @JsonIgnore
    private Provider publisher;

    @OneToMany(mappedBy = "game")
    @JsonIgnore
    private List<Contract> contracts;

    @ManyToMany
    @JoinTable(
        name = "game_tags",
        joinColumns = @JoinColumn(name = "game_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

}
