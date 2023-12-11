// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments metadata...');
  try {
    const res = await fetch(`http://${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments metadata', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function getFragmentData(user, id, ext = "") {
  console.log('Getting fragment data...');
  console.log(`http://${apiUrl}/v1/fragments/${id}${ext.length <= 0 ? '' : `.${ext}`}`);
  try {
    const res = await fetch(`http://${apiUrl}/v1/fragments/${id}${ext.length <= 0 ? '' : `.${ext}`}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const type = res.headers.get('Content-Type');

    if (type.includes('image')) {
      const data = await res.blob();
      const image = new Image();
      image.src = URL.createObjectURL(data);

      return image;
    }
    if (type.includes('text')) {
      const data = await res.text();
      const text = document.createTextNode(data);
      return text;
    }
    if (type.includes('json')) {
      const data = await res.json();
      const jData = JSON.stringify(data, null, 2);
      const text = document.createTextNode(jData);
      return text;
    }
  } catch (err) {
    console.error('Unable to call GET /v1/fragment/id', { err });
  }
}

export async function postUserFragment(user, fragment, type) {
  console.log('Attempting to post a fragment... ', apiUrl);
  try {
    const res = await fetch(`http://${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': type,
      },
      body: fragment,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Posted the fragment successfully', {data});
  } catch(err) {
    console.error('Unable to post to /v1/fragments', err);
  }
}

export async function updateUserFragment(user, fragment, id) {
  console.log("Attempting to update a user fragment....");
  try {
    //get the fragment first
    const getFragment = await fetch(`http://${apiUrl}/v1/fragments/${id}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!getFragment.ok) {
      throw new Error(`${getFragment.status} ${getFragment.statusText}`);
    }
    const type = getFragment.headers.get('Content-Type');

    const res = await fetch(`http://${apiUrl}/v1/fragments/${id}`, {
      method: "PUT",
      headers: {
        ...user.authorizationHeaders(),
        "Content-Type": type,
      },
      body: fragment,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Updated the fragment successfully', {data});
    return data;
  } catch (err) {
    console.error('Unable to update the fragment', err);
  }
}

export async function deleteUserFragment(user, id) {
  console.log('Attempting to delete a user fragment....');
  try {
    const res = await fetch(`http://${apiUrl}/v1/fragments/${id}`, {
      method: "DELETE",
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('deleted fragment successfully');
    return data;
  } catch (err) {
    console.error(err, 'error delete fragment');
  }
}