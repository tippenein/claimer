
;; title: case
;; version:
;; summary:
;; description:

;; a Claim is created between a claimant and a respondent
;; a Case is started by connecting a arbiter to an existing claim

;; constants
;;
(define-constant ERR_UNAUTHORIZED (err u6001))
(define-constant ERR_INVALID_CLAIM_RESPONDENT (err u6002))
(define-constant ERR_INVALID_ARBITER (err u6003))
(define-constant ERR_UNKNOWN_CLAIM (err u6004))
(define-constant CONTRACT_OWNER tx-sender)

(define-data-var lastClaimId uint u0)

(define-map Claim
  uint
  {
    claimant: principal,
    name: (string-ascii 255),
    respondent: principal,
    isActive: bool, ;; turned active when a Case is created for it
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
    (asserts! (not (is-eq tx-sender respondent)) ERR_INVALID_CLAIM_RESPONDENT)
    (map-set Claim
      newClaimId
      {
        claimant: tx-sender,
        name: name,
        respondent: respondent,
        isActive: true,
        isExecuted: false
      }
    )
    (var-set lastClaimId newClaimId)
    (ok newClaimId)
  )
)

;; get-claim
;; :: uint
;; -> (optional Claim)
(define-read-only (get-claim (claimId uint))
  (map-get? Claim claimId)
)

(define-public (create-case (claimId uint) (arbiter principal))
  (let
    (
      (claim (unwrap! (get-claim claimId) ERR_UNKNOWN_CLAIM))
    )
    (asserts! (not (is-eq arbiter CONTRACT_OWNER)) ERR_UNAUTHORIZED)
    (asserts! (not (is-eq (get respondent claim) arbiter)) ERR_INVALID_ARBITER)
    (map-set Case
      {
        claimId: claimId,
        arbiter: arbiter
      }
      false
    )
    (map-set Claim claimId (merge claim { isActive: true }) )
    (ok true)
  )
)

(define-read-only (is-claim-active (claimId uint))
  (let
    (
      (claim (unwrap! (get-claim claimId) ERR_UNKNOWN_CLAIM))
    )
    (if (get isActive claim)
      (ok true)
      (ok false)
    )
  )
)



;; PRIVATE