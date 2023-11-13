import {Auth, getUser} from './auth.js';
import { getUserFragments, postUserFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const fragmentForm = document.querySelector("#fragmentForm");
  const getAllFragments = document.querySelector("#getAllFragments");
  const fragmentsTable = document.querySelector("#fragmentsTable");
  let data;

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    // Do an authenticated request to the fragments API server and log the result
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  // Do an authenticated request to the fragments API server and log the result
  try {
    data = await getUserFragments(user);
    console.log(data);
  } catch (err) {
    console.error(`Error getting user fragments: ${err}`);
  }

  getAllFragments.addEventListener("click", function (event) {
    event.preventDefault();
    const tbody = fragmentsTable.querySelector('tbody');
    tbody.innerHTML = '';

    console.log(data);

    if (data) {
      data.fragments.forEach((fragment) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fragment.id}</td>
          <td>${fragment.ownerId}</td>
          <td>${fragment.created}</td>
          <td>${fragment.updated}</td>
          <td>${fragment.type}</td>
          <td>${fragment.size}</td>
        `;
        tbody.appendChild(row);
      });
      fragmentsTable.style.display = 'table';
    }
  });

  try {
    fragmentForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const fragmentValue = document.getElementById("fragment").value;
      const fragmentType = document.getElementById("selectBox").value;
      console.log(
        `Fragment Value: ${fragmentValue}, Fragment Type: ${fragmentType}`
      );
      await postUserFragment(user, fragment, fragmentType);
    });
  } catch (err) {
    console.error(`Error posting user fragment: ${err}`);
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);