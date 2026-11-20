
/**
 * 3-апта: Шектеулерді қанағаттандыру (CSP).
 * Отбасыларды эвакуация пункттеріне бөледі.
 * Жауапты: Нұрдаулет Шұғыла. Сипаттама: docs/SPEC.md, 5-бөлім.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CSP = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = {
    maxCost: Infinity,
    useMRV: true,
    useForwardChecking: true
  };

  /**
   * Бастапқы домендер:
   * медицина және қашықтық шектеулеріне сай пункттерді таңдайды.
   * Жақын пункт бірінші тұрады.
   */
  function initialDomains(families, shelters, distances, maxCost = Infinity) {
    const domains = {};

    for (const family of families) {
      const suitableShelters = shelters
        .map((shelter, index) => {
          const distance = distances?.[family.id]?.[shelter.id];

          return {
            id: shelter.id,
            distance,
            index
          };
        })
        .filter(item => {
          const shelter = shelters.find(s => s.id === item.id);

          // Медициналық көмек қажет болса,
          // тек медициналық пункттерді таңдаймыз.
          const medicalOk =
            !family.needsMedical || shelter.hasMedical === true;

          // Жол болуы және қашықтық maxCost мәнінен аспауы керек.
          const distanceOk =
            Number.isFinite(item.distance) &&
            item.distance <= maxCost;

          return medicalOk && distanceOk;
        })
        .sort((a, b) => {
          // Қашықтығы аз пункт бірінші.
          // Қашықтық бірдей болса, бастапқы реттілік сақталады.
          return a.distance - b.distance || a.index - b.index;
        });

      domains[family.id] = suitableShelters.map(item => item.id);
    }

    return domains;
  }

  /**
   * Отбасыларды эвакуация пункттеріне бөлу.
   */
  function solve(families, shelters, distances, options = {}) {
    const opt = { ...DEFAULTS, ...options };

    // 1. Кіріс деректерін тексеру.
    if (!Array.isArray(families) || !Array.isArray(shelters)) {
      throw new Error('Отбасылар мен эвакуация пункттері массив болуы керек');
    }

    for (const family of families) {
      if (!Number.isInteger(family.size) || family.size <= 0) {
        throw new Error(
          `${family.id}: отбасы мүшелерінің саны 0-ден жоғары бүтін сан болуы керек`
        );
      }
    }

    for (const shelter of shelters) {
      if (
        typeof shelter.capacity !== 'number' ||
        !Number.isFinite(shelter.capacity) ||
        shelter.capacity < 0
      ) {
        throw new Error(
          `${shelter.id}: эвакуация пунктінің сыйымдылығы теріс болмауы керек`
        );
      }
    }

    // Бастапқы бос орындарды есептейміз.
    const load = {};
    let totalCapacity = 0;
    let totalPeople = 0;

    for (const shelter of shelters) {
      load[shelter.id] = 0;
      totalCapacity += shelter.capacity;
    }

    for (const family of families) {
      totalPeople += family.size;
    }

    // 2. Жалпы орын жеткілікті ме?
    if (totalPeople > totalCapacity) {
      return {
        ok: false,
        reason: `Орын жетпейді: ${totalPeople} адам, ${totalCapacity} орын`,
        assignment: {},
        load: {},
        backtracks: 0,
        nodes: 0,
        steps: []
      };
    }

    // Бастапқы домендерді құрамыз.
    const domains = initialDomains(
      families,
      shelters,
      distances,
      opt.maxCost
    );

    // Әр отбасыға кемінде бір қолайлы пункт болуы керек.
    for (const family of families) {
      if (domains[family.id].length === 0) {
        return {
          ok: false,
          reason: `${family.id}: отбасыға сәйкес эвакуация пункті табылмады`,
          assignment: {},
          load: {},
          backtracks: 0,
          nodes: 0,
          steps: []
        };
      }
    }

    // 3. Backtracking үшін қажетті айнымалылар.
    const assignment = {};
    let backtracks = 0;
    let nodes = 0;
    const steps = [];

    // Пункттің бос орын санын тексеру.
    function canFit(family, shelterId, currentLoad) {
      const shelter = shelters.find(s => s.id === shelterId);

      return (
        shelter &&
        currentLoad[shelterId] + family.size <= shelter.capacity
      );
    }

    // 4. Рекурсивті Backtracking алгоритмі.
    function backtrack(currentDomains) {
      // Барлық отбасы бөлінсе, шешім табылды.
      if (Object.keys(assignment).length === families.length) {
        return true;
      }

      // Әлі бөлінбеген отбасылар.
      const remaining = families.filter(
        family => !Object.hasOwn(assignment, family.id)
      );

      // Қазір сыйатын пункттерді анықтаймыз.
      const getAvailable = family =>
        currentDomains[family.id].filter(shelterId =>
          canFit(family, shelterId, load)
        );

      let selectedFamily;

      if (opt.useMRV) {
        // MRV: ең аз қолайлы пункті бар отбасын бірінші таңдаймыз.
        // Егер саны бірдей болса, үлкен отбасын таңдаймыз.
        selectedFamily = remaining.reduce((best, family) => {
          const bestCount = getAvailable(best).length;
          const currentCount = getAvailable(family).length;

          if (currentCount < bestCount) return family;

          if (
            currentCount === bestCount &&
            family.size > best.size
          ) {
            return family;
          }

          return best;
        });
      } else {
        // MRV өшірулі болса, тізімдегі бірінші отбасы алынады.
        selectedFamily = remaining[0];
      }

      const availableShelters = getAvailable(selectedFamily);

      // Қолайлы пункт қалмаса, бұл жол тұйыққа тірелді.
      if (availableShelters.length === 0) {
        return false;
      }

      // Пункттерді жақыннан бастап тексереміз.
      for (const shelterId of availableShelters) {
        nodes++;

        // Отбасын пунктке уақытша орналастырамыз.
        assignment[selectedFamily.id] = shelterId;
        load[shelterId] += selectedFamily.size;

        steps.push({
          type: 'assign',
          family: selectedFamily.id,
          shelter: shelterId
        });

        let nextDomains = currentDomains;
        let hasEmptyDomain = false;

        // 5. Forward Checking.
        if (opt.useForwardChecking) {
          // Домендерді өзгертпей сақтау үшін көшірме жасаймыз.
          nextDomains = { ...currentDomains };

          for (const family of remaining) {
            if (family.id === selectedFamily.id) continue;

            const oldDomain = currentDomains[family.id];

            const newDomain = oldDomain.filter(id =>
              canFit(family, id, load)
            );

            // Сыймай қалған пункттерді доменнен алып тастаймыз.
            for (const id of oldDomain) {
              if (!newDomain.includes(id)) {
                steps.push({
                  type: 'prune',
                  family: family.id,
                  shelter: id
                });
              }
            }

            nextDomains[family.id] = newDomain;

            // Егер домен бос қалса, бірден тоқтаймыз.
            if (newDomain.length === 0) {
              hasEmptyDomain = true;
            }
          }
        }

        // Келесі отбасыларды бөлуге көшеміз.
        if (
          !hasEmptyDomain &&
          backtrack(nextDomains)
        ) {
          return true;
        }

        // 6. Backtracking: шешім табылмаса, артқа қайтамыз.
        delete assignment[selectedFamily.id];
        load[shelterId] -= selectedFamily.size;

        backtracks++;

        steps.push({
          type: 'backtrack',
          family: selectedFamily.id,
          shelter: shelterId
        });
      }

      return false;
    }

    // Алгоритмді іске қосамыз.
    const success = backtrack(domains);

    // 7. Нәтижені қайтарамыз.
    if (success) {
      return {
        ok: true,
        assignment,
        load,
        backtracks,
        nodes,
        steps
      };
    }

    return {
      ok: false,
      reason: 'Шектеулерді ескере отырып, отбасыларды бөлу мүмкін болмады',
      assignment: {},
      load: {},
      backtracks,
      nodes,
      steps
    };
  }

  return { DEFAULTS, initialDomains, solve };
});
