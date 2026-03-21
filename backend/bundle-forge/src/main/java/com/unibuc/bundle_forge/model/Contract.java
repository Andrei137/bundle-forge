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

import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Builder
@Entity
@Table(name = "contract")
public class Contract implements EnumUtils.HasStatus<Contract.Status> {

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContractId implements Serializable {

        @JsonView(ViewUtils.Provider.class)
        private Integer publisherId;

        @JsonView(ViewUtils.Provider.class)
        private Integer gameId;
    }

    public enum Status implements EnumUtils.TransitionAware<Status> {
        PENDING,
        ACCEPTED,
        REJECTED;

        @Override
        public boolean canTransitionFrom(Status from) {
            return switch (from) {
                case PENDING -> this == ACCEPTED || this == REJECTED;
                default -> false;
            };
        }
    }

    @EmbeddedId
    @JsonView(ViewUtils.Provider.class)
    private ContractId id;

    @ManyToOne
    @MapsId("publisherId")
    @JoinColumn(name = "publisher_id", nullable = false)
    @JsonView(ViewUtils.Provider.class)
    private Publisher publisher;

    @ManyToOne
    @MapsId("gameId")
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore
    private Game game;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private LocalDate createdAt = LocalDate.now();

    @JsonView(ViewUtils.Provider.class)
    private LocalDate expiryDate;

    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private Integer cutPercentage = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JsonView(ViewUtils.Provider.class)
    @Builder.Default
    private Status status = Status.PENDING;

}
