export async function getSnapshotProposals(space = 'ens.eth') {
  const query = `
    {
      proposals(
        first: 5,
        skip: 0,
        where: {
          space_in: ["${space}"]
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        state
        start
        end
        choices
        scores
        snapshot
      }
    }
  `;

  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data.proposals;
}
