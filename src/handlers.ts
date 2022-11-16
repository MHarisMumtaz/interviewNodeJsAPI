import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
import { get } from './httpRequest';

const urlApiPokeman = `https://pokeapi.co/api/v2/pokemon`;

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  
  let name: string = request.params['name']

  reply.headers['Accept'] = 'application/json';

  let params = {}
  let url = urlApiPokeman;
  name != null
      ? name.trim() != ''
      ? (params["name"] = name, url = url + '/', url = url + name)
      : (url = url + '"?offset=20"', url = url + "&limit=20")
      : (url = url + '"?offset=20"', url = url + "&limit=20")

  let response = await get(url);
  if (response == null) {
    reply.code(404);
  }

  const updatedResponse = await computeResponse(response);

  reply.send(updatedResponse);
  return reply;
}

/**
 * 
 * @param response 
 * @returns PokemonWithStats
 */
export const computeResponse = async (response: any): Promise<PokemonWithStats> => {

  const types = response.types.map(type => type.type.url);
  const pokemonTypes = [];
  
  for await (let url of types) {
    const result = await get(url);
    pokemonTypes.push(result);
  }
  if (pokemonTypes == undefined)
    throw pokemonTypes

  const stats = response.stats.map(element => {
    const stats = [];
    let averageStat = 0;
    pokemonTypes.map(pok =>
        pok.stats?.map(st =>
            st.stat.name.toUpperCase() == element.stat.name
                ? stats.push(st.base_state)
                : ([])
        )
    );
    
    if (stats.length > 0) {
      averageStat = stats.reduce((a, b) => a + b, 0) / stats.length;
    } else {
      averageStat = 0;
    }
    return {
      ...element,
      averageStat
    }
  });
  return {
    ...response,
    stats
  }
}