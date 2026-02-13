-- Dublikatları göstər
SELECT "clinicId", email, COUNT(*) AS cnt
FROM "Doctor"
WHERE email IS NOT NULL
GROUP BY "clinicId", email
HAVING COUNT(*) > 1;

-- Dublikatları təmizlə (ikinci və sonrakılarını NULL et)
WITH dups AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "clinicId", email ORDER BY "createdAt") AS rn
  FROM "Doctor"
  WHERE email IS NOT NULL
)
UPDATE "Doctor" d
SET email = NULL
FROM dups
WHERE d.id = dups.id AND dups.rn > 1;
