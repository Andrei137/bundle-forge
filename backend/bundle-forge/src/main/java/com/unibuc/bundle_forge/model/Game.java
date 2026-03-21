package com.unibuc.bundle_forge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unibuc.bundle_forge.utils.EnumUtils;
import com.unibuc.bundle_forge.utils.ViewUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Builder(toBuilder = true)
@Entity
@Table(name = "game")
public class Game implements EnumUtils.HasStatus<Game.Status> {

    public enum Status implements EnumUtils.TransitionAware<Status> {
        ANNOUNCED,
        DEVELOPED,
        PUBLISHED,
        DELISTED;

        @Override
        public boolean canTransitionFrom(Status from) {
            return switch (from) {
                case ANNOUNCED -> this == DEVELOPED;
                case DEVELOPED -> this == PUBLISHED || this == DELISTED;
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
    private Double price;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private Integer discountPercentage = 0;

    @Column(nullable = false)
    @JsonView(ViewUtils.Public.class)
    @Builder.Default
    private LocalDate releaseDate = LocalDate.now();

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

}
