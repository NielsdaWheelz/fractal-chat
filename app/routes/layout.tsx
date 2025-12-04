import { useEffect, useRef, useState } from "react";
import { Outlet, redirect } from "react-router";
import { SidebarApp as SidebarLeft } from "~/components/sidebar-app-left";
import { SidebarApp as SidebarRight } from "~/components/sidebar-app-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import {
  SidebarProvider as LeftSidebarProvider,
  SidebarInset,
  SidebarTriggerLeft,
} from "~/components/ui/sidebar-left";
import {
  SidebarProvider as RightSidebarProvider,
  SidebarTriggerRight,
} from "~/components/ui/sidebar-right";
// import { getAnnotations } from "~/index.server";
import { getAnnotations } from "~/server/annotations.server";
import { getSession, getUser } from "~/server/auth.server";
import { getDocumentAuthors } from "~/server/authors.server";
import { getChats } from "~/server/chats.server";
import { getDocument, getDocuments } from "~/server/documents.server";
import { getGroups } from "~/server/groups.server";
import type { Route } from "./+types/layout";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request);
  // if (!session?.user) return redirect("/");  // Disabled for screenshots

  // Mock user for screenshots when no session exists
  const user = session?.user || {
    id: "demo-user-id",
    name: "Dan Abramov",
    email: "demo@example.com",
    image: null
  };

  const userId = session?.user ? await getUser(request) : "demo-user-id";
  const docId = params?.id;

  // Mock data for screenshots
  const mockDocuments = [
    {
      id: "doc-1",
      url: "https://example.com/article-1",
      title: "Introduction to Machine Learning",
      content: "<p>Machine learning is a subset of artificial intelligence...</p>",
      textContent: "Machine learning is a subset of artificial intelligence...",
      publishedTime: "2024-01-15",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    },
    {
      id: "doc-2",
      url: "https://example.com/article-2",
      title: "Modern Web Development Practices",
      content: "<p>Web development has evolved significantly...</p>",
      textContent: "Web development has evolved significantly...",
      publishedTime: "2024-02-20",
      createdAt: new Date("2024-02-20"),
      updatedAt: new Date("2024-02-20")
    },
    {
      id: "doc-3",
      url: "https://example.com/article-3",
      title: "Understanding Neural Networks",
      content: "<p>Neural networks are computing systems inspired by biological neural networks...</p>",
      textContent: "Neural networks are computing systems inspired by biological neural networks...",
      publishedTime: "2024-03-10",
      createdAt: new Date("2024-03-10"),
      updatedAt: new Date("2024-03-10")
    },
    {
      id: "doc-4",
      url: "https://world.hey.com/jason/when-design-drives-behavior-49baf157",
      title: "When Design Drives Behavior",
      content: `<h1>When Design Drives Behavior</h1>

<p>In some cases, design is what something looks like.</p>

<p>In other cases, design is how something works.</p>

<p>But the most interesting designs to me are when design changes your behavior. Even the smallest details can change how someone interacts with something.</p>

<p>Take the power reserve indicator on the A. Lange & Söhne Lange 1 watch. The power reserve indicator indicates how much "power" (wind) is left. It's pictured below on the right side of the dial. It starts with AUF ("up") and ends with AB ("down"). A fully wound Lange 1 (indicator up at AUF) will give you about 72 hours before the watch fully runs out of power, stops, and must be wound again. It moves down as the watch runs until you're out of power. Wind it again to fill it back up.</p>

<p><img src="https://world.hey.com/jason/49baf157/blobs/eyJfcmFpbHMiOnsiZGF0YSI6MjI5MTUzNTg5OSwicHVyIjoiYmxvYl9pZCJ9fQ--8a5e070419da19277ebc2c0dd73503ff4d80e44e845643d361781b2106d55814/a-lange-sohne-lange-1-pink-gold-191.032-power-reserve-indication.jpg" alt="A. Lange & Söhne Lange 1 Watch" style="max-width: 100%; height: auto;" /></p>

<p>Simple enough, right? An indicator and a scale for fully wound through unwound. Just like a car's fuel gauge. You have full through empty, with a few ticks in between to indicate 3/4 or 1/4 tank left, and typically a red zone at the end saying you really need to fill this thing up soon or you're going to be stranded.</p>

<p>However, all is not as it seems on the Lange 1. There's something very clever going on here to change your behavior.</p>

<p>First you'll notice five triangles between AUF and AUB. They aren't equally spaced. At first you might think it looks like each is about a quarter of the scale, and then the last two at the bottom would be like the red zone on your fuel gage.</p>

<p>But no. The indicator follows a non-linear progression downwards. It doesn't sweep from top to bottom evenly over time. It's actually accelerated early.</p>

<p><img src="https://world.hey.com/jason/49baf157/blobs/eyJfcmFpbHMiOnsiZGF0YSI6MjI5MTU2Mjk0NywicHVyIjoiYmxvYl9pZCJ9fQ--09a33414b685c89a8af23fa6c72a2e093ca7d87cf41b1b99a5945859e86acbb0/Note%20Oct%207,%202025.png" alt="Power Reserve Indicator Diagram" style="max-width: 100%; height: auto;" /></p>

<p>When fully wound, It takes just a day for the indicator to drop down two markers to the halfway point. From there, it takes a day each to hit the lower two markers. This makes it look like it's unwinding faster than it is because the indicator covers more distance in that first 24 hours. If the spacing were uniform, and the indicator was linear, the owner might not feel the need to wind it until the power reserve was nearly fully depleted. Then you might have a dead watch when you pick it up the next morning.</p>

<p>So what's the net effect of this tiny little design detail that the owner may not even understand? Well, it looks like the watch is already half-way out of power after the first day, so it encourages the owner to wind the watch more frequently. To keep it closer to topped off, even when it's not necessary. This helps prevents the watch from running out of power, losing time, and, ultimately, stopping. A stopped watch may be right twice a day, but it's rarely at the times you want.</p>

<p>Small detail, material behavior change. Well considered, well executed, well done.</p>`,
      textContent: "When Design Drives Behavior\n\nIn some cases, design is what something looks like.\n\nIn other cases, design is how something works.\n\nBut the most interesting designs to me are when design changes your behavior. Even the smallest details can change how someone interacts with something.\n\nTake the power reserve indicator on the A. Lange & Söhne Lange 1 watch. The power reserve indicator indicates how much \"power\" (wind) is left. It's pictured below on the right side of the dial. It starts with AUF (\"up\") and ends with AB (\"down\"). A fully wound Lange 1 (indicator up at AUF) will give you about 72 hours before the watch fully runs out of power, stops, and must be wound again. It moves down as the watch runs until you're out of power. Wind it again to fill it back up.\n\nSimple enough, right? An indicator and a scale for fully wound through unwound. Just like a car's fuel gauge. You have full through empty, with a few ticks in between to indicate 3/4 or 1/4 tank left, and typically a red zone at the end saying you really need to fill this thing up soon or you're going to be stranded.\n\nHowever, all is not as it seems on the Lange 1. There's something very clever going on here to change your behavior.\n\nFirst you'll notice five triangles between AUF and AUB. They aren't equally spaced. At first you might think it looks like each is about a quarter of the scale, and then the last two at the bottom would be like the red zone on your fuel gage.\n\nBut no. The indicator follows a non-linear progression downwards. It doesn't sweep from top to bottom evenly over time. It's actually accelerated early.\n\nWhen fully wound, It takes just a day for the indicator to drop down two markers to the halfway point. From there, it takes a day each to hit the lower two markers. This makes it look like it's unwinding faster than it is because the indicator covers more distance in that first 24 hours. If the spacing were uniform, and the indicator was linear, the owner might not feel the need to wind it until the power reserve was nearly fully depleted. Then you might have a dead watch when you pick it up the next morning.\n\nSo what's the net effect of this tiny little design detail that the owner may not even understand? Well, it looks like the watch is already half-way out of power after the first day, so it encourages the owner to wind the watch more frequently. To keep it closer to topped off, even when it's not necessary. This helps prevents the watch from running out of power, losing time, and, ultimately, stopping. A stopped watch may be right twice a day, but it's rarely at the times you want.\n\nSmall detail, material behavior change. Well considered, well executed, well done.",
      publishedTime: "2024-04-01",
      createdAt: new Date("2024-04-01"),
      updatedAt: new Date("2024-04-01")
    }
  ];

  const mockGroups = [
    {
      id: "group-1",
      name: "The Page Turners",
      userId: "demo-user-id",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      members: [
        {
          id: "demo-user-id",
          name: "Dan Abramov",
          email: "demo@example.com",
          image: null,
          color: "0",
          isOwner: true
        },
        {
          id: "user-2",
          name: "Alice Johnson",
          email: "alice@example.com",
          image: null,
          color: "1",
          isOwner: false
        },
        {
          id: "user-3",
          name: "Bob Smith",
          email: "bob@example.com",
          image: null,
          color: "2",
          isOwner: false
        },
        {
          id: "user-4",
          name: "Carol Davis",
          email: "carol@example.com",
          image: null,
          color: "3",
          isOwner: false
        },
        {
          id: "user-5",
          name: "David Lee",
          email: "david@example.com",
          image: null,
          color: "4",
          isOwner: false
        }
      ],
      documents: [
        {
          id: "doc-4",
          title: "When Design Drives Behavior",
          url: "https://world.hey.com/jason/when-design-drives-behavior-49baf157",
          publishedTime: new Date("2024-04-01"),
          createdAt: new Date("2024-04-01")
        }
      ]
    },
    {
      id: "group-2",
      name: "Chapter & Verse",
      userId: "demo-user-id",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
      members: [
        {
          id: "demo-user-id",
          name: "Dan Abramov",
          email: "demo@example.com",
          image: null,
          color: "0",
          isOwner: true
        },
        {
          id: "user-6",
          name: "Emma Wilson",
          email: "emma@example.com",
          image: null,
          color: "5",
          isOwner: false
        },
        {
          id: "user-7",
          name: "Frank Martinez",
          email: "frank@example.com",
          image: null,
          color: "1",
          isOwner: false
        },
        {
          id: "user-8",
          name: "Grace Taylor",
          email: "grace@example.com",
          image: null,
          color: "2",
          isOwner: false
        }
      ],
      documents: [
        {
          id: "doc-2",
          title: "Modern Web Development Practices",
          url: "https://example.com/article-2",
          publishedTime: new Date("2024-02-20"),
          createdAt: new Date("2024-02-20")
        }
      ]
    },
    {
      id: "group-3",
      name: "AI Study Group",
      userId: "user-2",
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01"),
      members: [
        {
          id: "user-2",
          name: "Alice Johnson",
          email: "alice@example.com",
          image: null,
          color: "1",
          isOwner: true
        },
        {
          id: "demo-user-id",
          name: "Dan Abramov",
          email: "demo@example.com",
          image: null,
          color: "0",
          isOwner: false
        },
        {
          id: "user-9",
          name: "Henry Chen",
          email: "henry@example.com",
          image: null,
          color: "3",
          isOwner: false
        },
        {
          id: "user-10",
          name: "Iris Patel",
          email: "iris@example.com",
          image: null,
          color: "4",
          isOwner: false
        },
        {
          id: "user-11",
          name: "Jack Robinson",
          email: "jack@example.com",
          image: null,
          color: "5",
          isOwner: false
        },
        {
          id: "user-12",
          name: "Karen White",
          email: "karen@example.com",
          image: null,
          color: "2",
          isOwner: false
        }
      ],
      documents: [
        {
          id: "doc-1",
          title: "Introduction to Machine Learning",
          url: "https://example.com/article-1",
          publishedTime: new Date("2024-01-15"),
          createdAt: new Date("2024-01-15")
        },
        {
          id: "doc-3",
          title: "Understanding Neural Networks",
          url: "https://example.com/article-3",
          publishedTime: new Date("2024-03-10"),
          createdAt: new Date("2024-03-10")
        }
      ]
    },
    {
      id: "group-4",
      name: "Research Team",
      userId: "demo-user-id",
      createdAt: new Date("2024-03-15"),
      updatedAt: new Date("2024-03-15"),
      members: [
        {
          id: "demo-user-id",
          name: "Dan Abramov",
          email: "demo@example.com",
          image: null,
          color: "0",
          isOwner: true
        },
        {
          id: "user-13",
          name: "Laura Garcia",
          email: "laura@example.com",
          image: null,
          color: "1",
          isOwner: false
        },
        {
          id: "user-14",
          name: "Mike Anderson",
          email: "mike@example.com",
          image: null,
          color: "3",
          isOwner: false
        },
        {
          id: "user-15",
          name: "Nina Lopez",
          email: "nina@example.com",
          image: null,
          color: "4",
          isOwner: false
        },
        {
          id: "user-16",
          name: "Oscar Brown",
          email: "oscar@example.com",
          image: null,
          color: "5",
          isOwner: false
        }
      ],
      documents: [
        {
          id: "doc-2",
          title: "Modern Web Development Practices",
          url: "https://example.com/article-2",
          publishedTime: new Date("2024-02-20"),
          createdAt: new Date("2024-02-20")
        }
      ]
    }
  ];

  const mockChats = [
    {
      id: "chat-1",
      userId: "demo-user-id",
      documentId: params?.id || "doc-1",
      messages: [
        {
          role: "user" as const,
          parts: [
            {
              type: "text",
              text: "Can you explain the main concepts in this document?"
            }
          ],
          timestamp: new Date("2024-01-16T10:00:00")
        },
        {
          role: "assistant" as const,
          parts: [
            {
              type: "text",
              text: "This document covers several key concepts in machine learning, including supervised learning, unsupervised learning, and reinforcement learning. Each approach has its own use cases and applications."
            }
          ],
          timestamp: new Date("2024-01-16T10:00:30")
        }
      ],
      createdAt: new Date("2024-01-16"),
      updatedAt: new Date("2024-01-16")
    },
    {
      id: "chat-2",
      userId: "demo-user-id",
      documentId: "doc-4",
      messages: [
        {
          role: "user" as const,
          parts: [
            {
              type: "text",
              text: "What are the key takeaways from this article?"
            }
          ],
          timestamp: new Date("2024-04-02T14:00:00")
        },
        {
          role: "assistant" as const,
          parts: [
            {
              type: "text",
              text: "The main takeaway is how subtle design choices can influence user behavior without them realizing it. The watch example shows how non-linear indicators encourage more frequent winding."
            }
          ],
          timestamp: new Date("2024-04-02T14:00:45")
        }
      ],
      createdAt: new Date("2024-04-02"),
      updatedAt: new Date("2024-04-02")
    },
    {
      id: "chat-3",
      userId: "demo-user-id",
      documentId: "doc-2",
      messages: [
        {
          role: "user" as const,
          parts: [
            {
              type: "text",
              text: "How do these practices apply to our current project?"
            }
          ],
          timestamp: new Date("2024-02-21T09:00:00")
        },
        {
          role: "assistant" as const,
          parts: [
            {
              type: "text",
              text: "These modern practices emphasize component-based architecture, separation of concerns, and declarative programming patterns that can improve code maintainability."
            }
          ],
          timestamp: new Date("2024-02-21T09:01:00")
        }
      ],
      createdAt: new Date("2024-02-21"),
      updatedAt: new Date("2024-02-21")
    },
    {
      id: "chat-4",
      userId: "demo-user-id",
      documentId: "doc-3",
      messages: [
        {
          role: "user" as const,
          parts: [
            {
              type: "text",
              text: "Can you clarify the backpropagation section?"
            }
          ],
          timestamp: new Date("2024-03-11T16:30:00")
        },
        {
          role: "assistant" as const,
          parts: [
            {
              type: "text",
              text: "Backpropagation is the process of adjusting weights in the network by calculating gradients backwards from the output layer to the input layer, using the chain rule of calculus."
            }
          ],
          timestamp: new Date("2024-03-11T16:31:00")
        }
      ],
      createdAt: new Date("2024-03-11"),
      updatedAt: new Date("2024-03-11")
    },
    {
      id: "chat-5",
      userId: "demo-user-id",
      documentId: "doc-1",
      messages: [
        {
          role: "user" as const,
          parts: [
            {
              type: "text",
              text: "What are some real-world applications of these concepts?"
            }
          ],
          timestamp: new Date("2024-01-20T11:00:00")
        },
        {
          role: "assistant" as const,
          parts: [
            {
              type: "text",
              text: "These machine learning concepts are widely used in recommendation systems, fraud detection, image recognition, natural language processing, and autonomous vehicles."
            }
          ],
          timestamp: new Date("2024-01-20T11:01:00")
        }
      ],
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20")
    }
  ];

  const mockAuthors = [
    { id: "author-1", name: "Jason Fried" },
    { id: "author-2", name: "Dr. Sarah Chen" },
    { id: "author-3", name: "Prof. Michael Roberts" }
  ];

  const mockAnnotations = [
    {
      id: "annotation-1",
      userId: "demo-user-id",
      documentId: params?.id || "doc-4",
      body: "This is brilliant - the design subtly changes behavior without the user even realizing it",
      start: 130,
      end: 208,
      color: "0",
      quote: "But the most interesting designs to me are when design changes your behavior.",
      prefix: "works.\n\n",
      suffix: " Even the",
      visibility: "private" as const,
      createdAt: new Date("2024-04-02"),
      updatedAt: new Date("2024-04-02")
    },
    {
      id: "annotation-2",
      userId: "demo-user-id",
      documentId: params?.id || "doc-4",
      body: "Great example to illustrate the concept",
      start: 284,
      end: 356,
      color: "1",
      quote: "Take the power reserve indicator on the A. Lange & Söhne Lange 1 watch.",
      prefix: "something.\n\n",
      suffix: " The power",
      visibility: "private" as const,
      createdAt: new Date("2024-04-02"),
      updatedAt: new Date("2024-04-02")
    }
  ];

  // Safely handle database queries - return mock data for demo user
  const chats = session?.user ? (userId && docId ? await getChats(userId, docId) : []) : mockChats;
  const documents = session?.user ? await getDocuments() : mockDocuments;
  const groups = session?.user ? await getGroups(userId) : mockGroups;

  const waitForDocument = async () => {
    if (params?.id) {
      if (session?.user) {
        const document = await getDocument(params.id);
        return document;
      } else {
        // Return mock document for the requested ID
        return mockDocuments.find(d => d.id === params.id) || mockDocuments[0];
      }
    }
  };
  const waitForDocAuthors = async () => {
    if (params?.id) {
      if (session?.user) {
        return await getDocumentAuthors(params.id);
      } else {
        return mockAuthors;
      }
    }
  };

  const waitForAnnotations = async () => {
    if (params?.id) {
      if (session?.user) {
        return await getAnnotations(userId, params.id);
      } else {
        return mockAnnotations;
      }
    }
  };

  const document = await waitForDocument();
  const authors = await waitForDocAuthors();
  const annotations = await waitForAnnotations();

  return { user, chats, groups, documents, document, authors, annotations };
};

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const uiUser = {
    name: loaderData.user.name,
    email: loaderData.user.email,
    avatar: (loaderData.user.image as string | undefined) ?? "",
  };
  const selectionRef = useRef<string>("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [theme, setTheme] = useState("light");
  const [includeSelection, setIncludeSelection] = useState<boolean>(
    () => !!selectionRef?.current?.trim()
  );

  useEffect(() => {
    if (theme == "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    }

  }, [theme]);

  return (
    <>
      {/* documents chats */}

      <LeftSidebarProvider>
        <SidebarLeft side="left" data={loaderData} user={uiUser} setTheme={setTheme} theme={theme} />
        <RightSidebarProvider>
          <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 z-50 rounded-md">
              <div className="flex flex-1 justify-between items-center gap-2 px-3">
                <SidebarTriggerLeft />
                {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1 items-center">
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SidebarTriggerRight />
              </div>
            </header>
            <Outlet
              context={{ selectionRef, setShowHighlight, setIncludeSelection, theme }}
            />
          </SidebarInset>
          <SidebarRight
            side="right"
            data={loaderData}
            user={uiUser}
            selectionRef={selectionRef}
            includeSelection={includeSelection}
            setIncludeSelection={setIncludeSelection}
          />
          {/* <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            </SidebarInset> */}
        </RightSidebarProvider>
      </LeftSidebarProvider>
    </>
  );
};
export default Layout;
