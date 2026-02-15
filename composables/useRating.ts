import { rating, rate, ordinal } from 'openskill'

export const useRating = () => {
    // パラメータ定義
    const MU0 = 25.0
    const SIGMA0 = MU0 / 3
    const R_CENTER = 2000
    const S = 40
    const R_DELTA_MIN = 10
    const MU_DELTA_MIN = R_DELTA_MIN / S
    const SIGMA_FLOOR = SIGMA0 * 0.25

    // 表示レートを計算
    const calculateDisplayRating = (mu: number): number => {
        return Math.round(R_CENTER + S * (mu - MU0))
    }

    // 初期レーティングを作成
    const createInitialRating = () => {
        return rating({ mu: MU0, sigma: SIGMA0 })
    }

    // レーティングを更新
    const updateRatings = (
        players: Array<{ name: string; mu: number; sigma: number }>,
        ranks: number[]
    ) => {
        // OpenSkillのratingオブジェクトに変換
        const teams = players.map(p => [rating({ mu: p.mu, sigma: p.sigma })])

        // レーティング計算
        const newTeams = rate(teams, { rank: ranks })

        // 結果を処理
        const results = players.map((player, index) => {
            const oldMu = player.mu
            const oldSigma = player.sigma
            const newRating = newTeams[index][0]
            let newMu = newRating.mu
            let newSigma = newRating.sigma

            // 最低変動保証を適用
            let deltaMu = newMu - oldMu

            if (deltaMu > 0) {
                deltaMu = Math.max(deltaMu, MU_DELTA_MIN)
            } else if (deltaMu < 0) {
                deltaMu = Math.min(deltaMu, -MU_DELTA_MIN)
            } else {
                // deltaMu === 0 の場合、順位に応じて最低変動を適用
                if (ranks[index] < players.length / 2) {
                    deltaMu = MU_DELTA_MIN
                } else {
                    deltaMu = -MU_DELTA_MIN
                }
            }

            newMu = oldMu + deltaMu

            // σフロアを適用
            newSigma = Math.max(newSigma, SIGMA_FLOOR)

            const oldR = calculateDisplayRating(oldMu)
            const newR = calculateDisplayRating(newMu)
            const deltaR = newR - oldR

            return {
                name: player.name,
                mu: newMu,
                sigma: newSigma,
                oldRating: oldR,
                newRating: newR,
                delta: deltaR
            }
        })

        return results
    }

    return {
        MU0,
        SIGMA0,
        R_CENTER,
        S,
        SIGMA_FLOOR,
        calculateDisplayRating,
        createInitialRating,
        updateRatings
    }
}
