export async function handler(event, context) {
  event.Records.forEach((record) => {
    const { body } = record;
    console.log(body);
  });
  return {};
}
