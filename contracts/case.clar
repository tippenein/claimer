
;; title: case
;; version:
;; summary:
;; description:

;; a Claim is created between a claimant and a respondent
;; a Case is started by connecting a arbiter to an existing claim

;; constants
;;
(define-constant ERR_UNAUTHORIZED (err u6001))
(define-constant CONTRACT_OWNER tx-sender)


(define-data-var lastClaimId uint u0)
(define-map Claimant
  principal
  bool
)

(define-map Claims
  uint
  {
    creator: principal,
    name: (string-ascii 255),
    respondent: principal,
    isActive: bool,
    isExecuted: bool
  }
)

;; data maps
;;
(define-map Case
  { claimId: uint, arbiter: principal }
  bool
)

(define-read-only (get-last-claim-id)
  (var-get lastClaimId)
)

(define-public (create-claim (name (string-ascii 255)) (respondent principal))
  (let
    (
      (newClaimId (+ (var-get lastClaimId) u1))
    )
    (asserts! (is-claimant tx-sender) ERR_UNAUTHORIZED)
    (map-set Claims
      newClaimId
      {
        creator: tx-sender,
        name: name,
        respondent: respondent,
        isActive: false,
        isExecuted: false
      }
    )
    (var-set lastClaimId newClaimId)
    (ok newClaimId)
  )
)

(define-read-only (get-claim (claimId uint))
  (map-get? Claims claimId)
)

(define-public (create-case (claimId uint) (arbiter principal))
  (let
    (
      (claim (get-claim claimId))

    )
    (asserts! (is-eq arbiter CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (not (is-eq (get respondent claim) (some arbiter))) ERR_UNAUTHORIZED)
    (map-set Case
      {
        claimId: claimId,
        arbiter: arbiter
      }
      false
    )
    (ok true)
  )

)



;; PRIVATE
(define-read-only  (is-claimant (user principal))
  (default-to false (map-get? Claimant user))
)